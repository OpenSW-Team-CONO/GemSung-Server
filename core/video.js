exports.makeVideo = (videoKey, makePath, data, callbackFunc) => {
  var videoshow = require("videoshow");

  var videoOptions = {
    fps: 30,
    loop: 5, // seconds
    transition: true,
    transitionDuration: 1, // seconds
    videoBitrate: 1024,
    videoCodec: "libx264",
    size: "640x640",
    audioBitrate: "128k",
    audioChannels: 2,
    format: "mp4",
    pixelFormat: "yuv420p",
    useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
    subtitleStyle: {
      Fontname: "Verdana",
      Fontsize: "26",
      PrimaryColour: "11861244",
      SecondaryColour: "11861244",
      TertiaryColour: "11861244",
      BackColour: "-2147483640",
      Bold: "2",
      Italic: "0",
      BorderStyle: "2",
      Outline: "2",
      Shadow: "3",
      Alignment: "2", // left, middle, right
      MarginL: "40",
      MarginR: "60",
      MarginV: "40"
    }
  };
  makePath = `${makePath}video.mp4`;
  console.log(`[video] [makeVideo] ${videoKey} path:`, makePath);
  videoshow(data, videoOptions)
    //   .audio('song.mp3')
    .save(makePath)
    .on("start", function(command) {
      console.log(
        `[video] [makeVideo] ${videoKey} ffmpeg process started:`,
        command
      );
    })
    .on("error", function(err, stdout, stderr) {
      console.error(
        `[video] [makeVideo] ${videoKey} error:`,
        stderr,
        err,
        stdout
      );
      callbackFunc(null);
    })
    .on("end", function(output) {
      console.log(`[video] [makeVideo] ${videoKey} Video created in:`, output);
      callbackFunc(output);
    });
};

exports.videoGenerate = (videoKey, data) => {
    const fileManager = require('./file');
    const firebaseManager = require('./firebase')
    const makeVideoDir = fileManager.makeVideoDir;
    const downloadImages = fileManager.downloadImages;
    const uploadFile = firebaseManager.uploadFile;
    const updateVideoProcess = firebaseManager.updateVideoProcess;
    const makeVideo = this.makeVideo;

    const videoPath = makeVideoDir(videoKey);
    downloadImages(videoPath, data, (success) => {
        if (success) {
            data.map((item, index) => {
                item.path = `${videoPath}${index}.png`
            })
            console.log(`[video] [videoGenerate] ${videoKey} downloaded info`, data);

            makeVideo(videoKey, videoPath, data, (generatedVideoPath) => {
                if (generatedVideoPath) {
                    console.log(`[video] [videoGenerate] ${videoKey} ok video generated at ${generatedVideoPath}`)

                    uploadFile(videoKey, generatedVideoPath, signedUrls => {
                        fileManager.removeDir(videoPath);
                        if (signedUrls) {
                            updateVideoProcess(videoKey, 2, 'ok', signedUrls);
                            console.log(`[video] [videoGenerate] ${videoKey} end of generate video`)
                        } else {
                            console.error(`[video] [videoGenerate] ${videoKey} failed to upload video`)
                            updateVideoProcess(videoKey, -3, 'Upload video failed')
                        }
                    })
                } else {
                    console.error(`[video] [videoGenerate] ${videoKey} failed to generate video`)
                    fileManager.removeDir(videoPath)
                    updateVideoProcess(videoKey, -2, 'Generate video failed')
                }
            })
        } else {
            console.error(`[video] [videoGenerate] ${videoKey} failed to download images`);
            fileManager.removeDir(videoPath)
            updateVideoProcess(videoKey, -1, 'Download images failed')
        }
    })
}