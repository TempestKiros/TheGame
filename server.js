const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // <-- Importar cors

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las solicitudes
app.use(cors());

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/roguelikeDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conectado a MongoDB');
});

// Definir el esquema y modelo para los puntajes
const scoreSchema = new mongoose.Schema({
  name: String,
  rooms: Number,
  coins: Number
});
const Score = mongoose.model('Score', scoreSchema);

// Middleware para parsear JSON y servir archivos estáticos
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// Endpoint para enviar puntaje
app.post('/api/submitScore', (req, res) => {
  const { name, rooms, coins } = req.body;
  const newScore = new Score({ name, rooms, coins });
  newScore.save((err, savedScore) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(savedScore);
    }
  });
});

// Endpoint para obtener el ranking (ordenado por salas y monedas)
app.get('/api/leaderboard', (req, res) => {
  Score.find().sort({ rooms: -1, coins: -1 }).limit(10).exec((err, scores) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(scores);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});