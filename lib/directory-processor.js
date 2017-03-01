var _ = require('underscore');
var fs = require('fs');

var FileProcessor = require('./file-processor');

var DirectoryProcessor = function(appConfig, directoryId, dirPath, isChildDir) {
  this.appConfig = appConfig;
  this.directoryId = directoryId;
  this.dirPath = dirPath;
  this.isChildDir = isChildDir;
};

DirectoryProcessor.prototype.run = function() {
  var self = this

  this.appConfig.api.files.list(this.directoryId, function(data) {
    if (data.files.length == 0) {
      if (self.isChildDir) {
        self.deleteFromSource();
      }
    } else {
      var dirPath = self.dirPath;

      fs.mkdir(dirPath, 0766, function dirCreated() {
        _.each(data.files, function eachFile(fileNode) {
          var localFilePath = dirPath + '/' + fileNode.name;

          if (fileNode.content_type == 'application/x-directory') {
            var processor = new DirectoryProcessor(self.appConfig, fileNode.id, localFilePath, true);
            processor.run();
          } else {
            var processor = new FileProcessor(self.appConfig, fileNode, localFilePath);
            processor.run();
          }
        });
      });
    }
  });
};

DirectoryProcessor.prototype.deleteFromSource = function() {
  console.log('deleting empty directory from put.io');
  this.appConfig.api.files.delete(this.directoryId);
};

module.exports = DirectoryProcessor;
