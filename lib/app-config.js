var PutIO = require('put.io-v2');

var AppConfig = function(config, filebotConfigKey) {
  this.config = config;

  var filebotConfigKey = filebotConfigKey;

  this.filebotConfig = config.filebot[filebotConfigKey] || {};
  this.api = new PutIO(config.putIo.oauth2key);
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
