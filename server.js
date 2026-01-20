const express = require("express");
const multer = require("multer");
const cors = require("cors");
const supabase = require("./supabaseClient");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let videos = []; // временное хранилище видео для ленты

// Загрузка видео
app.post("/api/videos", upload.single("file"), async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!title || !file) return res.status(400).json({ error: "Нет данных" });

  const fileName = `${Date.now()}_${file.originalname}`;
  const { data, error } = await supabase.storage
    .from("videos")
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) return res.status(500).json({ error: error.message });

  const url = supabase.storage.from("videos").getPublicUrl(data.path).publicURL;

  const video = { id: Date.now(), title, url, likes: 0, comments: [] };
  videos.push(video);

  res.json(video);
});

// Лайки
app.post("/api/like/:id", (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.status(404).json({ error: "Видео не найдено" });
  video.likes += 1;
  res.json(video);
});

// Комменты
app.post("/api/comment/:id", (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.status(404).json({ error: "Видео не найдено" });
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: "Нет комментария" });
  video.comments.push(comment);
  res.json(video);
});

// Получение ленты
app.get("/api/videos", (req, res) => {
  res.json(videos);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
