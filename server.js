const express = require("express");
const app = express();
const supabase = require("./supabaseClient");
const multer = require("multer");

// Настройка multer для памяти (Render не даст хранить файлы локально)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static("public"));

let videos = [];

// Получить список видео
app.get("/api/videos", (req, res) => {
  res.json(videos);
});

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

  const url = supabase
    .storage
    .from("videos")
    .getPublicUrl(data.path).publicURL;

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
  if (!video) return res.sendStatus(404);
  video.likes++;
  res.json({ likes: video.likes });
});

// Комментарии
app.post("/api/comment/:id", (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.sendStatus(404);
  video.comments.push(req.body.text);
  res.json(video.comments);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MiniTube запущен на порту ${PORT}`));
