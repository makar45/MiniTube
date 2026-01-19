// server.js
const express = require("express");
const supabase = require("./supabaseClient");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Храним видео в памяти (можно заменить на базу позже)
let videos = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Загрузка видео
app.post("/api/videos", upload.single("file"), async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!title || !file) return res.status(400).json({ error: "Нет данных" });

  const { data, error } = await supabase.storage
    .from("videos")
    .upload(`${Date.now()}_${file.originalname}`, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) return res.status(500).json({ error: error.message });

  const url = supabase.storage.from("videos").getPublicUrl(data.path).publicURL;

  const video = {
    id: Date.now(),
    title,
    url,
    likes: 0,
    comments: [],
  };

  videos.push(video);
  res.json(video);
});

// Лайки
app.post("/api/like/:id", (req, res) => {
  const vid = videos.find(v => v.id == req.params.id);
  if (!vid) return res.status(404).json({ error: "Видео не найдено" });
  vid.likes++;
  res.json({ likes: vid.likes });
});

// Комменты
app.post("/api/comment/:id", (req, res) => {
  const vid = videos.find(v => v.id == req.params.id);
  if (!vid) return res.status(404).json({ error: "Видео не найдено" });
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: "Нет комментария" });
  vid.comments.push(comment);
  res.json({ comments: vid.comments });
});

// Получить все видео
app.get("/api/videos", (req, res) => {
  res.json(videos);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
