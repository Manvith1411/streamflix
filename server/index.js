require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');

const app = express();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const UPLOADS_DIR = path.join(__dirname, '..', 'frontend', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\._]/g, '');
    cb(null, safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(UPLOADS_DIR));

function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'no token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function adminOnly(req, res, next) {
  const adminIds = (process.env.ADMIN_IDS || '').split(',').map(x => x.trim()).filter(Boolean);
  if (!req.user) return res.status(401).json({ error: 'no token' });
  if (adminIds.length > 0) {
    if (!adminIds.includes(String(req.user.id))) return res.status(403).json({ error: 'forbidden' });
  } else {
    if (String(req.user.id) !== '1') return res.status(403).json({ error: 'forbidden' });
  }
  next();
}

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'missing' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const r = await pool.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email', [name, email, hashed]);
    res.json({ ok: true, user: r.rows[0] });
  } catch (e) {
    console.error('REGISTER ERROR', e);
    if (e.code === '23505') return res.status(400).json({ error: 'email_exists' });
    res.status(500).json({ error: 'db', message: e.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing' });
  try {
    const r = await pool.query('SELECT id,name,email,password_hash FROM users WHERE email=$1', [email]);
    const u = r.rows[0];
    if (!u) return res.status(401).json({ error: 'invalid' });
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid' });
    const token = jwt.sign({ id: u.id, name: u.name, email: u.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: u.id, name: u.name, email: u.email } });
  } catch (e) {
    console.error('LOGIN ERROR', e);
    res.status(500).json({ error: 'db', message: e.message });
  }
});

app.get('/api/movies', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT m.id, m.title, m.description, m.year, m.poster_url, array_remove(array_agg(g.name), NULL) as genre_names
      FROM movies m
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      GROUP BY m.id
      ORDER BY m.popularity DESC
      LIMIT 200
    `);
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db', message: e.message });
  }
});

app.get('/api/search', authMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const r = await pool.query(`
      SELECT m.id, m.title, m.year, m.poster_url, array_remove(array_agg(g.name), NULL) as genre_names
      FROM movies m
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE LOWER(m.title) LIKE $1
      GROUP BY m.id
      LIMIT 100
    `, ['%' + q.toLowerCase() + '%']);
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db', message: e.message });
  }
});

app.post('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const { movieId } = req.body || {};
    if (!movieId) return res.status(400).json({ error: 'missing movieId' });
    await pool.query('INSERT INTO favorites(user_id,movie_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [req.user.id, movieId]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db', message: e.message });
  }
});

app.post(
  '/api/admin/movies',
  authMiddleware,
  adminOnly,
  upload.single('poster'),
  async (req, res) => {
    try {
      const { title, description, year, popularity, genres } = req.body || {};
      if (!title) return res.status(400).json({ error: 'missing title' });

      const posterUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const r = await pool.query(
        `INSERT INTO movies(title, description, year, popularity, poster_url)
         VALUES($1,$2,$3,$4,$5) RETURNING id`,
        [title, description || null, year ? parseInt(year) : null, popularity ? Number(popularity) : 0, posterUrl]
      );
      const movieId = r.rows[0].id;

      if (genres) {
        const names = genres.split(',').map(s => s.trim()).filter(Boolean);
        for (const name of names) {
          try {
            await pool.query('INSERT INTO genres(name) VALUES($1) ON CONFLICT DO NOTHING', [name]);
            const gr = await pool.query('SELECT id FROM genres WHERE name=$1', [name]);
            const gid = gr.rows[0] && gr.rows[0].id;
            if (gid) await pool.query('INSERT INTO movie_genres(movie_id,genre_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [movieId, gid]);
          } catch (e) {
            console.error('GENRE ERROR', e);
          }
        }
      }

      res.json({ ok: true, id: movieId, poster_url: posterUrl });
    } catch (e) {
      console.error('ADMIN UPLOAD ERROR', e);
      res.status(500).json({ error: 'db', message: e.message });
    }
  }
);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Backend running on', port));
