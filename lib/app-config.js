var Client = require('put.io-node').Client;

var AppConfig = function(config, filebotConfigKey) {
  this.config = config;

  var filebotConfigKey = filebotConfigKey;

  this.filebotConfig = config.filebot[filebotConfigKey] || {};
};

AppConfig.prototype.putIoToken = function() {
  return this.config.putIo.oauth2key;
};

AppConfig.prototype.apiConnection = function() {
  return new Client(this.putIoToken());
};

AppConfig.prototype.aria2cPath = function() {
  return this.config.aria2c.path;
};

AppConfig.prototype.filebotPath = function() {
  return this.filebotConfig.path;
};

AppConfig.prototype.filebotEnabled = function() {
  return !!this.filebotConfig.enable;
};

AppConfig.prototype.filebotFormat = function() {
  return this.filebotConfig.format;
};

module.exports = AppConfig;
