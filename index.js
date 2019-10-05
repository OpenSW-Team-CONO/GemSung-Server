require('dotenv').config();

const PORT = process.env.PORT || 5000;
var express = require("express");
var app = express();
const bodyParser = require("body-parser");
global.admin = require("firebase-admin");

const testRoute = require('./route/test');
const videoRoute = require('./route/video');

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

console.log("[index] [init] service account exist?:", serviceAccount != null);

global.admin.initializeApp({
  credential: global.admin.credential.cert(serviceAccount),
  storageBucket: process.env.bucketName
});

app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.get('/ffmpeg', testRoute.ffmpeg);
app.get('/downloadAndUpload', testRoute.downloadAndUpload);
app.get('/getTempPath', testRoute.getTempPath);
app.get('/uploadTest', testRoute.uploadTest);
app.get('/makeTestVideoAndUpload', testRoute.makeTestVideoAndUpload);
app.post('/videoReq', testRoute.videoReq);

app.post('/generate', videoRoute.makeVideo);

app.listen(PORT, function() {
  console.log(`[index] [init] server started. port: ${PORT}!`);
});
