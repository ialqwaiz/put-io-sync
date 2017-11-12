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

  return this.appConfig.apiConnection().files.list(this.directoryId, function(data) {
    if (data.files.length == 0) {
      if (self.isChildDir) {
        self.deleteFromSource();
      }
    } else {
      var dirPath = self.dirPath;

      if (self.isChildDir && !fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, 0766);
      }

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
    }
  });
};

DirectoryProcessor.prototype.deleteFromSource = function() {
  console.log('deleting empty directory from put.io');

  return this.appConfig.apiConnection().files.delete(this.directoryId);
};

module.exports = DirectoryProcessor;
