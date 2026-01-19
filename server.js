const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let videos = [];

app.get("/api/videos", (req, res) => {
  res.json(videos);
});

app.post("/api/videos", (req, res) => {
  const { title, url } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: "Нет данных" });
  }

  videos.push({
    id: Date.now(),
    title,
    url,
    likes: 0,
    comments: []
  });

  res.json({ success: true });
});

app.post("/api/like/:id", (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.sendStatus(404);
  video.likes++;
  res.json({ likes: video.likes });
});

app.post("/api/comment/:id", (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.sendStatus(404);
  video.comments.push(req.body.text);
  res.json(video.comments);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("MiniTube работает"));
