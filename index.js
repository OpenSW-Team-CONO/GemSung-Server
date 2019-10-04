const PORT = process.env.PORT || 5000;
var express = require("express");
var app = express();
const bodyParser = require("body-parser");

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

app.get("/test", function(req, res) {
  const keyFilename = "./private/service-account.json";
  const projectId = "the-gemsung";
  const bucketName = "the-gemsung.appspot.com";
  const filePath = `./package.json`;
  const mime = require("mime");
  const uploadTo = `testfolder/package.json`;
  const fileMime = mime.getType(filePath);
  const admin = require("firebase-admin");

  const serviceAccount = require(keyFilename);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucketName
  });

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
        console.log("file", file);
        res.send("ok");
        return;
      }
    }
  );
});

app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});
