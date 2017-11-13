var fs = require('fs');
var Promise = require('bluebird');

var FileProcessor = require('./file-processor');

var DirectoryProcessor = function(appConfig, directoryId, dirPath, isChildDir) {
  this.appConfig = appConfig;
  this.directoryId = directoryId;
  this.dirPath = dirPath;
  this.isChildDir = isChildDir;
};

DirectoryProcessor.prototype.run = function() {
  console.log("Processing directory:", this.dirPath, this.directoryId);
  var self = this

  return this.appConfig.apiConnection().files.getFilesList(this.directoryId).then(function(data) {
    const files = JSON.parse(data).files;

    if (files.length == 0) {
      if (self.isChildDir) {
        return self.deleteFromSource();
      }
    } else {
      var dirPath = self.dirPath;

      if (self.isChildDir && !fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, 0766);
      }

      return Promise.each(files, function eachFile(fileNode) {
        var localFilePath = dirPath + '/' + fileNode.name;

        console.log("Processing entry in directory:", localFilePath);

        if (fileNode.content_type == 'application/x-directory') {
          var processor = new DirectoryProcessor(self.appConfig, fileNode.id, localFilePath, true);
          return processor.run();
        } else {
          var processor = new FileProcessor(self.appConfig, fileNode, localFilePath);
          return processor.run();
        }
      });
    }
  });
};

DirectoryProcessor.prototype.deleteFromSource = function() {
  console.log('deleting empty directory from put.io');

  return this.appConfig.apiConnection().files.deleteFiles([this.directoryId]);
};

module.exports = DirectoryProcessor;
