const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Создаем папку для видео, если нет
if (!fs.existsSync("videos")) fs.mkdirSync("videos");

// Настройка Multer для загрузки видео
const upload = multer({ dest: "videos/" });

// Раздача фронтенда
app.use(express.static("public"));
app.use("/videos", express.static("videos"));

// Загрузка видео
app.post("/upload", upload.single("videoFile"), (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join("videos", req.file.originalname);
  fs.rename(tempPath, targetPath, err => {
    if(err) return res.status(500).send("Ошибка при сохранении видео");
    res.redirect("/");
  });
});

// Получение списка видео
app.get("/videosList", (req,res)=>{
  const files = fs.readdirSync("videos").filter(f=>f.endsWith(".mp4"));
  res.json(files);
});

// Запуск сервера
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));