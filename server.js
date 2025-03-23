const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'deposit-tracker-data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// API endpoint to get data
app.get('/api/data', (req, res) => {
  try {
    // Check if the file exists
    if (!fs.existsSync(DATA_FILE)) {
      // Return default data if file doesn't exist
      return res.json({
        deposit: 30,
        leverage: 10,
        dailyTarget: 3,
        initialDeposit: 30,
        days: [],
        archivedDays: [],
        goals: []
      });
    }

    // Read the file
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading data file:', error);
    res.status(500).json({ error: 'Failed to read data file' });
  }
});

// API endpoint to save data
app.post('/api/data', (req, res) => {
  try {
    // Write the data to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing data file:', error);
    res.status(500).json({ error: 'Failed to write data file' });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data will be stored in: ${DATA_FILE}`);
}); 