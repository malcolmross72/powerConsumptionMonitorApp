const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

const dataFile = path.join(__dirname, 'data', 'plantData.json');

// === Middleware ===
// Serve static frontend files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Allow requests from any origin (for local dev)
app.use(cors());

// Parse incoming JSON request bodies
app.use(bodyParser.json());

// Helpers
function ensureFile() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ users: [], plants: [] }, null, 2));
  }
}

function readData() {
  ensureFile();
  return JSON.parse(fs.readFileSync(dataFile));
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Register
app.post('/api/register', (req, res) => {
  const { plantId, passcode } = req.body;
  const data = readData();

  if (data.users.find(u => u.plantId === plantId)) {
    return res.json({ success: false, message: "ID already exists." });
  }

  data.users.push({ plantId, passcode });
  writeData(data);
  res.json({ success: true, message: "New ID created! You can now log in." });
});

// Login
app.post('/api/login', (req, res) => {
  const { plantId, passcode } = req.body;
  const data = readData();

  const user = data.users.find(u => u.plantId === plantId && u.passcode === passcode);
  res.json({ success: !!user, message: user ? "Login successful" : "Invalid ID or Passcode." });
});

// Save Plant Info
app.post('/api/savePlantInfo', (req, res) => {
  const { plantId, name, location, capacity } = req.body;
  const data = readData();

  let plant = data.plants.find(p => p.plantId === plantId);
  if (plant) {
    plant.name = name;
    plant.location = location;
    plant.capacity = capacity;
  } else {
    data.plants.push({ plantId, name, location, capacity, records: [] });
  }

  writeData(data);
  res.json({ success: true });
});

// Get Plant Info
app.get('/api/getPlantInfo', (req, res) => {
  const { plantId } = req.query;
  const data = readData();
  const plant = data.plants.find(p => p.plantId === plantId);
  res.json(plant || {});
});

// Save Record
app.post('/api/saveRecord', (req, res) => {
  const { plantId, date, usage } = req.body;
  const data = readData();

  const plant = data.plants.find(p => p.plantId === plantId);
  if (!plant) return res.json({ success: false });

  if (!plant.records) plant.records = [];
  plant.records.push({ date, usage });
  writeData(data);
  res.json({ success: true });
});

// Get Records
app.get('/api/getRecords', (req, res) => {
  const { plantId } = req.query;
  const data = readData();

  const plant = data.plants.find(p => p.plantId === plantId);
  res.json({ records: (plant && plant.records) || [] });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));