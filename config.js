//'register an app here https://put.io/v2/oauth2/register and enter the generated oauth2 token here'
module.exports = {
  'putIo': {
    //'oauth2key': 'token'
    'oauth2key': process.env.PUTIO_TOKEN
  },
  'aria2c': {
    'path': 'aria2c',
  },
  'filebot': {
		'configKey e.g. "tvshows"': {
			'enable': false,
			'path': 'filebot',
			'format': '/some/path/{n}/{n} - {s00e00} - {t}'
		},
		'configKey e.g. "movies"': {
			'enable': false,
			'path': 'filebot',
			'format': '/some/path/{n}{t}'
		}
  }
};
