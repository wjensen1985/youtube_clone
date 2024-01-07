import express from "express";

import { 
    uploadProcessedVideo,
    uploadThumbnail,
    downloadRawVideo,
    deleteRawVideo,
    deleteProcessedVideo,
    deleteThumbnail,
    convertVideo,
    makeThumbnail,
    setupDirectories
  } from './storage';


// set up directories?
setupDirectories();

const app = express();
app.use(express.json());

// Process a video file from Cloud Storage into 360p and create a thumbnail
app.post("/process-video-and-make-thumbnail", async (req, res) => {
  // Get the bucket and filename from the Cloud Pub/Sub message
  let data;
  try {
    const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error('Invalid message payload received.');
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send('Bad Request: missing filename.');
  }

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;
  const thumbnailFileName = `thumbnail-${inputFileName}`;

  // Download the raw video from Cloud Storage
  await downloadRawVideo(inputFileName);

  // Process the video into 360p
  try { 
    await convertVideo(inputFileName, outputFileName)
  } catch (err) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName)
    ]);
    console.log(err);
    return res.status(500).send('Processing failed');
  }
  
  // Upload the processed video to Cloud Storage
  await uploadProcessedVideo(outputFileName);

  // make thumbnail
  try { 
    await makeThumbnail(thumbnailFileName, outputFileName)
  } catch (err) {
    await Promise.all([
      deleteRawVideo(outputFileName),
      deleteThumbnail(thumbnailFileName)
    ]);
    console.log(err);
    return res.status(500).send('Thumbnail failed');
  }
  
  // Upload the thumbnail to Cloud Storage
  await uploadThumbnail(thumbnailFileName);

  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
    deleteThumbnail(thumbnailFileName)
  ]);

  return res.status(200).send('Processing and thumbnail creation finished successfully');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(
        `Server is running on port: ${port}`
    );
});