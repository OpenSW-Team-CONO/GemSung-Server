exports.makeVideo = (req, res) => {
    const videoManager = require('../core/video')
    videoManager.videoGenerate(req.body.videoKey, req.body.src);
    res.send({
        success: true,
        message: 'Pending generate video.'
    })
}