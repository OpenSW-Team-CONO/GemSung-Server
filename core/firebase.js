exports.uploadFile = (videoKey, filePath, callbackFunc) => {
    const fileManager = require('./file')
    const mime = require("mime");
    const uploadTo = `video/${videoKey}.mp4`;
    console.log(`[firebase] [uploadFile] ${videoKey} file will upload at ${uploadTo}`)
    const fileMime = mime.getType(filePath);
  
    const bucket = global.admin.storage().bucket();
    bucket.upload(
      filePath,
      {
        destination: uploadTo,
        public: true,
        metadata: { contentType: fileMime }
      },
      function(err, file) {
        if (err) {
            console.error(`[firebase] [uploadFile] ${videoKey} upload video failed ${err}`);
            callbackFunc(null);
          return;
        } else {
            file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
              }).then(signedUrls => {
                  console.log(`[firebase] [uploadFile] ${videoKey} uploaded successfully. url: ${signedUrls}`)
                  callbackFunc(signedUrls)
              }).catch(err => {
                console.error(`[firebase] [uploadFile] ${videoKey} make signed url failed ${err}`);
                callbackFunc(null);
              });
        }
      }
    );
}

exports.updateVideoProcess = (videoKey, state, message = null, urls = null) => {
    const db = global.admin.database();
    const ref = db.ref(`${videoKey}`);
    const flagRef = ref.child('flag');
    flagRef.set(state)
    console.log(`[firebase] [updateVideoProcess] flag set ${state}`)

    const urlsRef = ref.child('urls');
    urlsRef.set(urls);
    console.log(`[firebase] [updateVideoProcess] urls ${urls}`)

    const messageRef = ref.child('message');
    messageRef.set(message);
    console.log(`[firebase] [updateVideoProcess] message ${message}`);
}