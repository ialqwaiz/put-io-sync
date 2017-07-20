var execSync = require('execSync');
var fs = require('fs');

var FileProcessor = function(appConfig, fileNode, filePath) {
  this.appConfig = appConfig;
  this.fileNode = fileNode;
  this.filePath = filePath;
};

FileProcessor.prototype.run = function() {
  var self = this;
  var filePath = this.filePath;

  fs.stat(filePath, function(err, stat) {
    if (self.deleteIfCompleted(stat)) {
      if (self.appConfig.filebotEnabled()) {
        self.processWithFilebot(stat);
      }
      return;
    }

    self.downloadFile();

    var afterStat = fs.statSync(filePath);

    self.deleteIfCompleted(afterStat);

    if (self.appConfig.filebotEnabled()) {
      self.processWithFilebot(afterStat);
    }
  });
};

FileProcessor.prototype.downloadFile = function() {
  var ariaPath = this.appConfig.aria2cPath();
  var downloadUrl = this.appConfig.apiConnection().files.download(this.fileNode.id)
  var containingDirectory = this.filePath.replace(/\/[^\/]+$/, '');

  var shellCommand = ariaPath + ' --file-allocation=none -x6 -d "' + containingDirectory + '" "' + downloadUrl + '"';

  console.log('downloading ' + this.filePath + '...');
  console.log(shellCommand);
  return execSync.run(shellCommand);
};

FileProcessor.prototype.deleteIfCompleted = function(stat) {
  if (stat && stat.size == this.fileNode.size) {
    var partialDownloadExists = fs.existsSync(this.filePath+'.aria2');

    if (!partialDownloadExists) {
      this.deleteFromSource();

      return true;
    }
  };

  return false;
};

FileProcessor.prototype.deleteFromSource = function() {
  console.log('deleting ' + this.fileNode.name + ' from put.io');
  try {
    this.appConfig.apiConnection().files.delete(this.fileNode.id);
  } catch(err) {
    console.log('encountered error during deletion:', err);
  }
};

FileProcessor.prototype.processWithFilebot = function(stat) {
  if (this.isProbablyVideoFileSize(stat.size)) {
    var shellCommand = this.appConfig.filebotPath() + ' --conflict override -rename -no-xattr -non-strict --format "' + this.appConfig.filebotFormat() + '" "' + this.filePath + '"';

    console.log('processing ' + this.filePath + ' with filebot');
    console.log(shellCommand);
    execSync.run(shellCommand);
  }
};

FileProcessor.prototype.isProbablyVideoFileSize = function(fileSize) {
  return fileSize > 20 * 1024 * 1024;
};

module.exports = FileProcessor;
