const express = require("express");
const youtubedl = require('youtube-dl-exec'); // instead of yt-dlp-exec
const path = require("path");
const fs = require("fs");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // bypass SSL

const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

// Homepage
app.get("/", (req, res) => {
  res.render("index");
});

// Download route
app.post("/download", async (req, res) => {
  let videoURL = req.body.url;
  if (!videoURL) return res.status(400).send("No URL provided");

  // Clean youtu.be URLs
  if (videoURL.includes("youtu.be")) videoURL = videoURL.split("?")[0];

  const output = path.resolve(`video_${Date.now()}.mp4`);

  try {
    await youtubedl(videoURL, {
      output,
      mergeOutputFormat: "mp4",
      noCheckCertificate: true,
      update: true // fetch latest yt-dlp binary
    });

    res.download(output, "video.mp4", (err) => {
      if (err) console.error(err);
      fs.unlinkSync(output); // cleanup
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error downloading video: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
