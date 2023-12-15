const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.post('/getWeather', async (req, res) => {
  const location = req.body.location;
  const apiKey = 'dffe1b6eb4694ee494533218232010'; // Replace with your API key
  const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});
