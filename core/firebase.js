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
    .then(() => {
      console.log(`[firebase] [updateVideoProcess] flag set ${state}`)
    })
    .catch((err) => {
      console.error(`[firebase] [updateVideoProcess] flag set failed ${err}`)
    })

    const urlsRef = ref.child('urls');
    urlsRef.set(urls)
      .then(() => {
        console.log(`[firebase] [updateVideoProcess] urls set ${urls}`)
      })
      .catch((err) => {
        console.error(`[firebase] [updateVideoProcess] urls set failed${err}`)
      });

    const messageRef = ref.child('message');
    messageRef.set(message)
    .then(() => {
      console.log(`[firebase] [updateVideoProcess] message set ${message}`);
    })
    .catch((err) => {
      console.error(`[firebase] [updateVideoProcess] message set failed ${err}`);
    });
}