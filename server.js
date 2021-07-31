const express = require("express");
const webshot = require("webshot-node");
const bodyParser = require("body-parser");
let ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
let ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();

const portToListen = 3000;
app.listen(portToListen);

app.use(bodyParser.json());

const saveTo = "C:\\Users\\gilsh\\visual_studio_code\\JS\\Assignment";
const screenPath = "screenShot.png";
const fileType = "mp4";
const fileName = "output";
const videoDuration = 10;
const savedLocation = saveTo + "\\" + fileName + "." + fileType;

// set the options to screen shot
optionsWebshotPromise = {
  defaultWhiteBackground: true,
  customCSS: "body {background-color: white;}",
};

// make webShot (screen shot function) async function
const webshotPromise = (url, screenPath, optionsWebshotPromise) =>
  new Promise((resolve, reject) => {
    webshot(url, screenPath, optionsWebshotPromise, (e) =>
      !e ? resolve(true) : reject(e)
    );
  });

/**
 * convertPromise - this function create a mp4 video from an image
 * @returns bolean
 */
const convertPromise = () =>
  new Promise((resolve, reject) => {
    let command = ffmpeg(screenPath)
      .withOutputFormat("mp4")
      .noAudio()
      .loop(videoDuration)
      .preset("divx")
      .saveToFile(savedLocation)
      .on("error", function (err) {
        console.log("Error takes place");
        return false;
      })
      .on("end", function (stdout, stderr) {
        console.log("Video created");
        return true;
      });
    if (command !== undefined) resolve(true);
    else {
      reject(false);
    }
  });

/**
 * take a screen shot of a given url and then use use convertPromis to make a video
 * @param url the given url
 * @returns bolean
 */
async function takeShot(url) {
  const finishedImage = await webshotPromise(
    url,
    screenPath,
    optionsWebshotPromise
  );
  let ans = false
  if (finishedImage) {
    console.log("screenshot taken");
     ans = await convertPromise();
  }
  return ans;
}

app.post("/", async function (req, res) {
  let url = req.body.url;
  console.log("given url: " + url);

  let result = await takeShot(url);
  let response = { path: `failed` };
  if (result) {
    response = { path: `file: ${savedLocation}` };
    res.status(200).send(response);
  } else {
    res.status(400).send(response);
  }
});

