var PutIO = require('put.io-v2');
var argv = require( 'argv' );
var _ = require('underscore');
var fs = require('fs');
var execSync = require('execSync');
var Pushover = require('node-pushover');
if (!XMLHttpRequest) {
  var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}
var TVShowMatcher = require('./tvshowdir');
var config = require('./config');

var push = null;
if (config.pushpin.enabled) {
  push = new Pushover({
    token: config.pushpin.appkey,
    user: config.pushpin.userkey
  });
} else {
  push = {
    send: function() {}
  };
}

var api = new PutIO(config.putIo.oauth2key);

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
  name: 'tvshow-dir',
  short: 's',
  type: 'path',
  description: '(optional) local filepath of your TV show dir'
}]).run();

var directoryId = args.options['directory-id'] || 0;
var localPath = args.options['local-path'];
var tvShowDir = args.options['tvshow-dir'];
var matcher = null;
if (tvShowDir) {
  matcher = TVShowMatcher(tvShowDir);
} else {
  matcher = function() {};
}

function deleteShowIfCompleted(api, fileNode, stat) {
  if (stat && stat.size == fileNode.size) {
    // this file was allready downloaded - so we might delete it
    console.log('deleting ' + fileNode.name + ' from put.io');
    api.files.delete(fileNode.id);
    return true;
  };

  return false;
}

function sendRPCRequest(host, methodName, params) {
  if (!params) params = [];

  var req = new XMLHttpRequest();
  req.open('POST', 'http://' + host + '/jsonrpc');
  req.setRequestHeader("Content-Type","application/json");
  req.onload = function(e) {
    if (req.status != 200) {
      console.dir(req);
    } else {
      var o = JSON.parse(req.responseText);

      if (o.error) {
        console.dir({method: methodName, params: params, error: o.error});
      }
    }
  }
  req.send(JSON.stringify({
    "jsonrpc":"2.0",
    "method":methodName,
    "params": params,
    "id":"1"
  }));
}

function listDir(directoryId, localPath, isChildDir) {
  api.files.list(directoryId, function gotPutIoListing(data) {
    if (data.files.length == 0) {
      if (isChildDir) {
        console.log('deleting empty directory from put.io');
        api.files.delete(directoryId);
      }
    } else {
      fs.mkdir(localPath, 0766, function dirCreated() {
        _.each(data.files, function eachFile(fileNode) {
          var localFilePath = localPath + '/' + fileNode.name;

          if (fileNode.content_type == 'application/x-directory') {
            listDir(fileNode.id, localFilePath, true);
          } else {
            var fileDir = localPath;
            var tvshow = matcher(fileNode.name);

            if (tvshow) fileDir = tvshow.path;

            var finalPath = fileDir + '/' + fileNode.name;

            fs.stat(finalPath, function gotFileStat(err, stat) {
              if (deleteShowIfCompleted(api, fileNode, stat)) {
                return;
              }

              if (config.aria2c.rpcHost && config.aria2c.useRPC) {
                console.log('adding ' + localFilePath + ' to the download queue...');
                sendRPCRequest(config.aria2c.rpcHost, 'aria2.addUri',
                                                      [ [ api.files.download(fileNode.id) ],
                                                        { dir: fileDir } ]);
              } else {
                var shellCommand = config.aria2c.path + ' -d "' + fileDir + '" "' + api.files.download(fileNode.id) + '"';

                console.log('downloading ' + localFilePath + '...');
                console.log(shellCommand);
                var result = execSync.stdout(shellCommand);

                var afterStat = fs.statSync(finalPath);
                deleteShowIfCompleted(api, fileNode, afterStat);

                if (fileNode.size > 20 * 1024 * 1024) {
                  if (tvshow) {
                    push.send('put.io sync', 'downloaded an episode of ' + tvshow.name);
                  } else {
                    push.send('put.io sync', 'Downloaded ' + fileNode.name);
                  }
                }

              }
            });
          }
        });
      });
    }
  });
}

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
  listDir(directoryId, localPath, false);

}

