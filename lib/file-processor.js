var spawn = require('child_process').spawnSync;
var fs = require('fs');
var Promise = require('bluebird');

var FileProcessor = function(appConfig, fileNode, filePath) {
  this.appConfig = appConfig;
  this.fileNode = fileNode;
  this.filePath = filePath;
};

FileProcessor.prototype.run = function() {
  console.log("Processing file: ", this.filePath, this.fileNode.id);

  var self = this;
  var filePath = this.filePath;
  var stat;

  if (self.fileExists()) {
    stat = self.fileStat();
  }

  if (self.isCompleted(stat)) {
    return self.deleteFromSource().then(() => {
      if (self.appConfig.filebotEnabled()) {
        self.processWithFilebot(stat);
      }
      console.log("File done 1");
    });
  } else {
    return self.downloadFile().then(() => {
      var afterStat;

      if (self.fileExists()) {
        afterStat = self.fileStat();
      }

      if (self.isCompleted(afterStat)) {
        return self.deleteFromSource().then(() => {
          if (self.appConfig.filebotEnabled()) {
            self.processWithFilebot(afterStat);
          }
          console.log("File done 2");
        });
      } else {
        if (self.appConfig.filebotEnabled()) {
          self.processWithFilebot(afterStat);
        }
        console.log("File done 3");
      }
    });
  }
};

FileProcessor.prototype.fileExists = function() {
  return fs.existsSync(this.filePath);
};

FileProcessor.prototype.fileStat = function() {
  return fs.statSync(this.filePath);
};

FileProcessor.prototype.downloadFile = function() {
  console.log('downloading ' + this.filePath + '...');

  return new Promise((resolve) => {
    var ariaPath = this.appConfig.aria2cPath();
    var url = this.downloadUrl(this.fileNode.id);
    var containingDirectory = this.filePath.replace(/\/[^\/]+$/, '');

    var spawnArgs = ['--file-allocation=none', '-x6', '-d', containingDirectory, url];

    console.log(ariaPath, spawnArgs);
    spawn(ariaPath, spawnArgs, { stdio: 'inherit' });

    return resolve();
  });
};

FileProcessor.prototype.downloadUrl = function(fileId) {
  var token = this.appConfig.putIoToken();
  return 'https://api.put.io/v2/'+'files/'+fileId+'/download?oauth_token='+token;
}

FileProcessor.prototype.isCompleted = function(stat) {
  if (stat && stat.size == this.fileNode.size) {
    var partialDownloadExists = fs.existsSync(this.filePath+'.aria2');

    if (!partialDownloadExists) {
      return true;
    }
  };

  return false;
};

FileProcessor.prototype.deleteFromSource = function() {
  console.log('deleting ' + this.fileNode.name + ' from put.io');

  return this.appConfig.apiConnection().files.deleteFiles([this.fileNode.id]);
};

FileProcessor.prototype.processWithFilebot = function(stat) {
  if (this.isProbablyVideoFileSize(stat.size)) {
    var filebotPath = this.appConfig.filebotPath();
    var spawnArgs = [
      '--conflict', 'override',
      '-rename'
      '-no-xattr'
      '-non-strict'
      '--format' ,this.appConfig.filebotFormat(),
      this.filePath
    ];

    console.log('processing ' + this.filePath + ' with filebot');
    console.log(filebotPath, spawnArgs);
    spawn(filebotPath, spawnArgs, { stdio: 'inherit' });
  }
};

FileProcessor.prototype.isProbablyVideoFileSize = function(fileSize) {
  return fileSize > 20 * 1024 * 1024;
};

module.exports = FileProcessor;
