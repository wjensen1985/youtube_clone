import {Storage} from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = "whwj-yt-clone-raw-videos";
const processedVideoBucketName = "whwj-yt-clone-processed-videos";
const thumbnailsBucketName = "whwj-yt-clone-thumbnails";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";
const localThumbnailsPath = "./thumbnails";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
  ensureDirectoryExistence(localRawVideoPath);
  ensureDirectoryExistence(localProcessedVideoPath);
  ensureDirectoryExistence(localThumbnailsPath);
}


/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale=-1:360") // 360p
      .on("end", function () {
        console.log("Processing finished successfully");
        resolve();
      })
      .on("error", function (err: any) {
        console.log("An error occurred: " + err.message);
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

/**
 * @param thumbnailName - The name of the file to save thumbnail {@link localThumbnailsPath}.
 * @param processedVideoName - The name of the processed video file to get thumbnail from {@link localProcessedVideoPath}.
 * @returns A promise that resolves when thumbnail has been created
 */
export function makeThumbnail(thumbnailName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
      ffmpeg(`${localProcessedVideoPath}/${processedVideoName}`)
      .takeScreenshots({
        filename: `${localThumbnailsPath}/${thumbnailName}`,
        count: 1
        })
        .on('end', function() {
            console.log('Processing finished successfully');
            resolve();
        })
        .on('error', function(err: any) {
            console.log('An error occurred: ' + err.message);
            reject(err);
        })
    });
  }


/**
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
  await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({
      destination: `${localRawVideoPath}/${fileName}`,
    });

  console.log(
    `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
  );
}


/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
  const bucket = storage.bucket(processedVideoBucketName);

  // Upload video to the bucket
  await storage.bucket(processedVideoBucketName)
    .upload(`${localProcessedVideoPath}/${fileName}`, {
      destination: fileName,
    });
  console.log(
    `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
  );

  // Set the video to be publicly readable
  await bucket.file(fileName).makePublic();
}


/**
 * @param fileName - The name of the file to upload from the 
 * {@link localThumbnailsPath} folder into the {@link thumbnailsBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadThumbnail(fileName: string) {
  const bucket = storage.bucket(thumbnailsBucketName);

  // Upload video to the bucket
  await storage.bucket(thumbnailsBucketName)
    .upload(`${localProcessedVideoPath}/${fileName}`, {
      destination: fileName,
    });
  console.log(
    `${localProcessedVideoPath}/${fileName} uploaded to gs://${thumbnailsBucketName}/${fileName}.`
  );

  // Set the video to be publicly readable
  await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */
export function deleteRawVideo(fileName: string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}


/**
* @param fileName - The name of the file to delete from the
* {@link localProcessedVideoPath} folder.
* @returns A promise that resolves when the file has been deleted.
* 
*/
export function deleteProcessedVideo(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}


/**
* @param fileName - The name of the file to delete from the
* {@link localThumbnailsPath} folder.
* @returns A promise that resolves when the file has been deleted.
* 
*/
export function deleteThumbnail(fileName: string) {
  return deleteFile(`${localThumbnailsPath}/${fileName}`);
}


/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file at ${filePath}`, err);
          reject(err);
        } else {
          console.log(`File deleted at ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log(`File not found at ${filePath}, skipping delete.`);
      resolve();
    }
  });
}


/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
    console.log(`Directory created at ${dirPath}`);
  }
}