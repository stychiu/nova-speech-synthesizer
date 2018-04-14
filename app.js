var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var say = require('say');

var app = express();
var port = process.env.PORT || 2000;

app.use(bodyParser.json());

app.post('/tts/v1', function (req, res) {
  console.log('POST /tts/v1');
  console.log('Request:', req.body);

  // Export spoken audio to a WAV file
  // Say does not currently support export on Windows
  // This module uses the export function in pull request (still open) https://github.com/Marak/say.js/pull/72
  // To install more voices on Windows 7 or 8, see https://superuser.com/questions/590779/how-to-install-more-voices-to-windows-speech
  var filename = Date.now() + '.wav';
  console.log('Exporting to ' + filename);
  
  say.export(req.body.text, 'Microsoft Server Speech Text to Speech Voice (en-GB, Hazel)', 1.1, filename, function (error) {
    if (error) {
      return console.log(error)
    }
    console.log('Export complete.')

    var filepath = path.join(__dirname, filename);
    var stat = fs.statSync(filepath);

    res.writeHead(200, {
      'Content-Type': 'audio/wav',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filepath);
    readStream.pipe(res);

    fs.unlinkSync(filename);
  })
});

var server = app.listen(port, function () {
    console.log('Listening on port ' + port);
});