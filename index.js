const PORT = process.env.PORT || 5000;
var express = require("express");
var app = express();
const bodyParser = require("body-parser");

const admin = require("firebase-admin");

const serviceAccount = {
  "type": process.env.type,
  "project_id": process.env.project_id,
  "private_key_id": process.env.private_key_id,
  "private_key": process.env.private_key.replace(/\\n/g, '\n'),
  "client_email": process.env.client_email,
  "client_id": process.env.client_id,
  "auth_uri": process.env.auth_uri,
  "token_uri": process.env.token_uri,
  "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
  "client_x509_cert_url": process.env.client_x509_cert_url
}

console.log('service account exist?:', serviceAccount != null);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.bucketName
});


app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.get("/ffmpeg", function(req, res) {
  var spawn = require("child_process").spawn,
    ls = spawn("ffmpeg", ["-version"]);

  ls.stdout.on("data", function(data) {
    console.log("stdout: " + data);
    res.send("out: " + data);
  });

  ls.stderr.on("data", function(data) {
    console.log("stderr: " + data);

    res.send("error: " + data);
  });

  ls.on("exit", function(code) {
    console.log("exit: " + code);
  });
});

app.post("/video", function(req, res) {
  console.log("request body", req.body);
  res.send("ok");
});

app.get('/temp', (req, res) => {
  var fs = require("fs");
  var path = require("path");
  var temp_dir = path.join(process.cwd(), 'temp/');
  res.send(`path: ${temp_dir}`);
});

app.get("/test", function(req, res) {
  console.log('env type:', process.env.type);
  const keyFilename = "./private/service-account.json";
  const projectId = "the-gemsung";
  const filePath = `./package.json`;
  const mime = require("mime");
  const uploadTo = `testfolder/package.json`;
  const fileMime = mime.getType(filePath);

  const bucket = admin.storage().bucket();
  bucket.upload(
    filePath,
    {
      destination: uploadTo,
      public: true,
      metadata: { contentType: fileMime }
    },
    function(err, file) {
      if (err) {
        console.log(err);
        res.send(`error ${err}`);
        return;
      } else {
        // console.log("file", file);
        res.send("ok");
        return;
      }
    }
  );
});

app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});
