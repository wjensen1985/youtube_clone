import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
    // get path of the input video file from request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath){
        res.status(400).send("bad request: missing file path.");
    }

    ffmpeg(inputFilePath)
        .outputOptions(['-vf', 'scale=360:-1']) // 360p
        .on('end', function() {
            console.log('Processing finished successfully');
            res.status(200).send('Processing finished successfully');
        })
        .on('error', function(err: any) {
            console.log('An error occurred: ' + err.message);
            res.status(500).send('An error occurred: ' + err.message);
        })
        .save(outputFilePath);
});

app.post("/make-thumbnail", (req, res) => {
    // get path of the input video file from request body
    const videoFilePath = req.body.videoFilePath;
    const thumbnailFilePath = req.body.thumbnailFilePath;

    if (!videoFilePath || !thumbnailFilePath){
        res.status(400).send("bad request: missing file path.");
    }

    ffmpeg(videoFilePath)
        .takeScreenshots({
            filename: thumbnailFilePath,
            count: 1
        })
        .on('end', function() {
            console.log('Processing finished successfully');
            res.status(200).send('Processing finished successfully');
        })
        .on('error', function(err: any) {
            console.log('An error occurred: ' + err.message);
            res.status(500).send('An error occurred: ' + err.message);
        })
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(
        `Video processing service listening at http://localhost:${port}`
    );
});