const PORT = process.env.PORT || 5000
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/ffmpeg', function(req, res) {
  var spawn = require('child_process').spawn, ls = spawn('ffmpeg', ['-version']);
  
  ls.stdout.on('data', function(data) {
      console.log('stdout: ' + data);
      res.send('out: ' + data)
  });
  
  ls.stderr.on('data', function(data) {
      console.log('stderr: ' + data);

      res.send('error: ' + data);
  });
  
  ls.on('exit', function(code) {
      console.log('exit: ' + code);
  });
});

app.post('/video', function(req, res) {
  console.log('request body', req.body);
  res.send('ok');
})

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});
