// ===== MiniTube Server с Supabase =====
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const upload = multer(); // временное хранение в памяти
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --------- Подключение Supabase ----------
const supabaseUrl = 'https://pdjvbiklvdyztbroeque.supabase.co';
const supabaseKey = 'sb_publishable_2vpVbBSF_Ue7e_Q8q1Z5rg_bl4SqgCf';
const supabase = createClient(supabaseUrl, supabaseKey);
// -----------------------------------------

let videos = []; // массив для видео {id, ссылка, лайки, комментарии}

// ---------- Загрузка видео через + ----------
app.post('/upload', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).send('Нет файла');

  const file = req.file;
  const fileName = Date.now() + '-' + file.originalname;

  // Загружаем видео в Supabase
  const { data, error } = await supabase
    .storage
    .from('videos')
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) return res.status(500).send(error.message);

  // Получаем публичную ссылку
  const { publicURL } = supabase
    .storage
    .from('videos')
    .getPublicUrl(fileName);

  // Добавляем в массив
  videos.push({ id: videos.length + 1, file: publicURL, likes: 0, comments: [] });
  res.send('OK');
});

// --------- Получение списка видео ----------
app.get('/videos', (req, res) => {
  res.json(videos);
});

// --------- Лайки ----------
app.post('/like/:id', (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.status(404).send('Видео не найдено');
  video.likes++;
  res.send('OK');
});

// --------- Комментарии ----------
app.post('/comment/:id', (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.status(404).send('Видео не найдено');
  const { comment } = req.body;
  video.comments.push(comment);
  res.send('OK');
});

// --------- Запуск сервера ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MiniTube работает на порту ${PORT}`));
