exports.getTempDirPath = () => {
  var fs = require("fs");
  var path = require("path");
  const tempDir = path.join(process.cwd(), "temp/");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  return tempDir;
};

exports.makeVideoDir = videoKey => {
  var fs = require("fs");
  const videoPath = `${this.getTempDirPath()}${videoKey}/`;
  console.log(`[file] [makeDir] videoPath: ${videoPath}`);
  if (!fs.existsSync(videoPath)) {
    fs.mkdirSync(videoPath);
  }
  return videoPath;
};

exports.removeDir = path => {
    const rimraf = require("rimraf");
    rimraf.sync(path);
}

exports.downloadImages = (videoPath, data, callbackFunc) => {
  const downloader = require("image-downloader");
  let counter = 0;
  const imageLength = data.length;

  data.map((item, index) => {
    console.log(`[file] [downloadImages] #${index} download started`, item);
    downloader
      .image({
        url: item.path,
        dest: `${videoPath}${index}.png`
      })
      .then(({ filename, image }) => {
        counter++;
        console.log(
          `[file] [downloadImages] ${filename} is downloaded successfully ${counter} / ${imageLength}. path: ${videoPath}`
        );
        if (imageLength === counter) {
          console.log(
            `[file] [downloadImages] download process ended. path: ${videoPath}`
          );
          callbackFunc(true);
        }
      })
      .catch(err => {
        console.error(`[file] [downloadImages] download image error ${err}`);
        callbackFunc(false);
      });
  });
};
