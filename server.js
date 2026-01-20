const express = require("express");
const cors = require("cors");
const multer = require("multer");
const supabase = require("./supabaseClient");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload = multer({ storage: multer.memoryStorage() });
let videos = [];

// Загрузка видео через файл
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

// Лайки
app.post("/api/like/:id", (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.status(404).json({ error: "Видео не найдено" });
  video.likes++;
  res.json(video);
});

// Комментарии
app.post("/api/comment/:id", (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.status(404).json({ error: "Видео не найдено" });
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: "Нет комментария" });
  video.comments.push(comment);
  res.json(video);
});

// Получить все видео
app.get("/api/videos", (req, res) => {
  res.json(videos);
});

app.listen(port, () => console.log(`MiniTube запущен на порту ${port}`));
