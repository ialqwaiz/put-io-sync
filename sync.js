var argv = require( 'argv' );
var fs = require('fs');

require('longjohn');

var AppConfig = require('./lib/app-config');
var DirectoryProcessor = require('./lib/directory-processor');
var configSettings = require('./config');

var args = argv.option([{
  name: 'directory-id',
  short: 'd',
  type: 'int',
  description: 'id of the directory to sync'
}, {
  name: 'local-path',
  short: 'l',
  type: 'path',
  description: 'local dir to sync to'
}, {
  name: 'filebot-config',
  short: 'f',
  type: 'string',
  description: '(optional) filebot config key'
}]).run();

var directoryId = args.options['directory-id'] || 0;
var localPath = args.options['local-path'];
var filebotConfigKey = args.options['filebot-config'];

var appConfig = new AppConfig(configSettings, filebotConfigKey);

var lockFile = '/tmp/putiosync-' + directoryId + '.lock';

if (fs.existsSync(lockFile)) {
  console.log('Process already running. If it is not the delete ' + lockFile);
} else {
  process.on('exit', function() {
    fs.unlinkSync(lockFile);
  });
  fs.open(lockFile, 'w', 0666, function(err, fd) {
    fs.closeSync(fd);
  });

  var processor = new DirectoryProcessor(appConfig, directoryId, localPath, false);
  processor.run();
}
