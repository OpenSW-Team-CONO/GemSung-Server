require('dotenv').config();

const PORT = process.env.PORT || 5000;
var express = require("express");
var app = express();
const bodyParser = require("body-parser");

const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key.replace(/\\n/g, "\n"),
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url
};

console.log("service account exist?:", serviceAccount != null);

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

app.get("/download", (req, res) => {
  const download = require("image-downloader");
  var fs = require("fs");
  var path = require("path");
  var temp_dir = path.join(process.cwd(), "temp/");

if (!fs.existsSync(temp_dir)){
    fs.mkdirSync(temp_dir);
}

  const tempPath = `${temp_dir}file.jpg`;
  const file = fs.createWriteStream(`${temp_dir}file.jpg`);
  console.log("file will save at ", tempPath);
  const options = {
    url:
      req.query['url'] || "https://live.staticflickr.com/7151/6760135001_14c59a1490_o.jpg",
    dest: tempPath // Save to /path/to/dest/image.jpg
  };
  download
    .image(options)
    .then(({ filename, image }) => {
      console.log("Saved to", filename); // Saved to /path/to/dest/image.jpg
      console.log("file saved, load and upload process start");
      const filePath = tempPath;
      const mime = require("mime");
      const uploadTo = `testfolder/file.jpg`;
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
            console.log("ok");
            res.send("ok");
            return;
          }
        }
      );
    })
    .catch(err => console.error(err));
});

app.get("/temp", (req, res) => {
  var fs = require("fs");
  var path = require("path");
  var temp_dir = path.join(process.cwd(), "temp/");
  res.send(`path: ${temp_dir}`);
});

app.get("/test", function(req, res) {
  console.log("env type:", process.env.type);
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

app.get('/make', (req, res) => {
  var videoshow = require('videoshow')

var images = [
  {
    path :'src/1.png',
    caption: 'ninon'
  },
  {
    path :'src/2.png',
    caption: 'negev'
  },
  {
    path :'src/3.png',
    caption: 'hestia'
  }
]
var videoOptions = {
  fps: 30,
  loop: 5, // seconds
  transition: true,
  transitionDuration: 1, // seconds
  videoBitrate: 1024,
  videoCodec: 'libx264',
  size: '640x640',
  audioBitrate: '128k',
  audioChannels: 2,
  format: 'mp4',
  pixelFormat: 'yuv420p',
  useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
  subtitleStyle: {
    Fontname: 'Verdana',
    Fontsize: '26',
    PrimaryColour: '11861244',
    SecondaryColour: '11861244',
    TertiaryColour: '11861244',
    BackColour: '-2147483640',
    Bold: '2',
    Italic: '0',
    BorderStyle: '2',
    Outline: '2',
    Shadow: '3',
    Alignment: '2', // left, middle, right
    MarginL: '40',
    MarginR: '60',
    MarginV: '40'
  }
}
var path = require("path");
var temp_dir = path.join(process.cwd(), "temp/");
const makePath = `${temp_dir}video.mp4`
console.log('make video at', makePath);
videoshow(images, videoOptions)
//   .audio('song.mp3')
  .save(makePath)
  .on('start', function (command) {
    console.log('ffmpeg process started:', command)
  })
  .on('error', function (err, stdout, stderr) {
    console.error('Error:', err)
    console.error('ffmpeg stderr:', stderr)
    res.send(`error: ${err}`)
  })
  .on('end', function (output) {
    console.error('Video created in:', output)

    const filePath = makePath;
      const mime = require("mime");
      const uploadTo = `testfolder/video.mp4`;
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
            console.log("ok");
            file.getSignedUrl({
              action: 'read',
              expires: '03-09-2491'
            }).then(signedUrls => {
              // signedUrls[0] contains the file's public URL
              res.send(JSON.stringify(signedUrls));
              return;
            }).catch(err => {
              res.send(`Error ${err}`)
              return;
            });
          }
        }
      );
  })
})

app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});
