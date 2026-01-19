const express = require("express");
const app = express();
const supabase = require("./supabaseClient");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static("public"));

let videos = [];

app.post("/api/videos", upload.single("file"), async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!title || !file) return res.status(400).json({ error: "Нет данных" });

  const { data, error } = await supabase.storage
    .from("videos")
    .upload(`${Date.now()}_${file.originalname}`, file.buffer, {
      contentType: file.mimetype
    });

  if (error) return res.status(500).json({ error: error.message });

  const url = supabase.storage.from("videos").getPublicUrl(data.path).publicURL;

  const video = {
    id: Date.now(),
    title,
    url,
    likes: 0,
    comments: []
  };

  videos.push(video);
  res.json(video);
});

app.post("/api/like/:id", (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.status(404).json({ error: "Видео не найдено" });
  video.likes += 1;
  res.json(video);
});

app.post("/api/comment/:id", (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.status(404).json({ error: "Видео не найдено" });
  video.comments.push(req.body.comment);
  res.json(video);
});

app.get("/api/videos", (req, res) => {
  res.json(videos);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
