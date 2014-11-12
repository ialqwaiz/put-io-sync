module.exports = {
  'putIo': {
    'oauth2key': 'register an app here https://put.io/v2/oauth2/register and enter the generated oauth2 token here'
  },
  'aria2c': {
    'path': 'aria2c',
    'rpcHost': '127.0.0.1:6800', // you might run into problems if you use 'localhost' here
    'useRPC': true
  },
  'pushpin': {
    'enabled': false,
    'userkey': 'user key from here: https://pushover.net/ ',
    'appkey': 'create an key here: https://pushover.net/apps/build '
  },
  'filebot': {
		'configKey e.g. "tvshows"': {
			'enable': true,
			'path': 'filebot',
			'format': '/some/path/{n}/{n} - {s00e00} - {t}'
		},
		'configKey e.g. "movies"': {
			'enable': true,
			'path': 'filebot',
			'format': '/some/path/{n}{t}'
		}
  }
};
