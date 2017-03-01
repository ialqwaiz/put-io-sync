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
        processWithFilebot(stat);
      }
      return;
    }

    self.downloadFile();

    var afterStat = fs.statSync(filePath);

    self.deleteIfCompleted(afterStat);

    if (self.appConfig.filebotEnabled()) {
      processWithFilebot(afterStat);
    }
  });
};

FileProcessor.prototype.downloadFile = function() {
  var ariaPath = this.appConfig.aria2cPath();
  var downloadUrl = this.appConfig.api.files.download(this.fileNode.id)
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
  this.appConfig.api.files.delete(this.fileNode.id);
};

FileProcessor.prototype.processWithFilebot = function(stat) {
  if (isProbablyVideoFileSize(stat.size)) {
    var shellCommand = this.appConfig.filebotPath() + ' --conflict override -rename -no-xattr -non-strict --format "' + filebotConfig.format + '" "' + this.filePath + '"';

    console.log('processing ' + this.filePath + ' with filebot');
    console.log(shellCommand);
    execSync.run(shellCommand);
  }
};

FileProcessor.prototype.isProbablyVideoFileSize = function(fileSize) {
  return fileSize > 20 * 1024 * 1024;
};

module.exports = FileProcessor;
