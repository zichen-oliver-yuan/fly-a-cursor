// Assuming you have a canvas element with the id 'stringCanvas'
const canvas = document.getElementById('stringCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cursor = document.getElementById('cursor');
const body = document.getElementsByTagName('body')[0];
const realCursor = { x: -100, y: -100 }; // Position of the system cursor
const kiteStringBaseLength = 100; // Base length of the kite's string
let stringLength = kiteStringBaseLength; // Actual length of the string

const buttons = document.querySelectorAll('button');
var windResult = document.getElementById('windResult');

let drawState = false;

// let mouseX = -100;
// let mouseY = -100;
let cursorX = -100;
let cursorY = -100;
const delay = 0.2;
const windIntensity = 40;
const noiseMultiplier = 0.004;

let windSpeed = 0;
let windDirection = 0;
let gustSpeed = 0;
//dealing with the api

const noiseGenerator = new SimplexNoise();

document.addEventListener('mousemove', (event) => {
  realCursor.x = event.clientX;
  realCursor.y = event.clientY;
});

function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

// function lerp(start, end, factor) {
//   return start + (end - start) * factor;
// }

// function windEffect(x, y, t) {
//   const noiseX = noiseGenerator.noise3D(x * noiseMultiplier, y * noiseMultiplier, t * noiseMultiplier);
//   const noiseY = noiseGenerator.noise3D(y * noiseMultiplier, x * noiseMultiplier, t * noiseMultiplier);
//   return { x: windIntensity * noiseX, y: windIntensity * noiseY };
// }

// function updateCursor() {
//   const currentTime = Date.now();
//   const wind = windEffect(cursorX, cursorY, currentTime);

//   cursorX = lerp(cursorX, mouseX + wind.x, delay);
//   cursorY = lerp(cursorY, mouseY + wind.y, delay);

//   cursor.style.left = `${cursorX}px`;
//   cursor.style.top = `${cursorY}px`;

//   requestAnimationFrame(updateCursor);
// }

// function fetchWeatherData() {
//   fetch('/getWeather') // Adjust the endpoint as necessary
//     .then((response) => response.json())
//     .then((data) => {
//       windSpeed = data.current.wind_kph; // Adjust according to the API response format
//       windDirection = data.current.wind_degree; // Adjust according to the API response format
//       gustSpeed = data.current.gust_kph; // Adjust according to the API response format
//     })
//     .catch((error) => console.error('Error fetching weather data:', error));
// }

//inject the data into the html

//gpt weatherdata

//////////////////chatgpt kite stuff

// document.addEventListener('mousemove', (event) => {
//   realCursor.x = event.clientX;
//   realCursor.y = event.clientY;
// });

function windEffect() {
  const windAngleRadians = (windDirection - 90) * (Math.PI / 180); // Convert wind direction to radians. Minus 90 to account for the wind direction being 0° = North
  const windX = Math.cos(windAngleRadians) * mapRange(windSpeed, 0, 10, 0, 200);
  const windY = Math.sin(windAngleRadians) * mapRange(windSpeed, 0, 10, 0, 200);

  gustFactor = mapRange(gustSpeed, 0, 20, 0, 0.001);
  const noiseX = noiseGenerator.noise2D(realCursor.x * noiseMultiplier, Date.now() * gustFactor) * gustSpeed; // Use the gust speed to adjust the noise factor
  const noiseY = noiseGenerator.noise2D(realCursor.y * noiseMultiplier, Date.now() * gustFactor) * gustSpeed; //tried out different ways to do this, this is the best one so far...

  cursor.style.width = `${30 + noiseX * 0.5}px`;
  cursor.style.height = `${45 + noiseX * 0.5}px`;
  // console.log(cursor.style.width, cursor.style.height);

  return { x: windX + noiseX, y: windY + noiseY };
}

function updateCursor() {
  if (drawState) {
    cursor.style.display = 'block';
    canvas.style.display = 'block';
    body.style.cursor = 'grabbing';
  }

  const wind = windEffect();

  // Update the string length based on wind speed
  stringLength = kiteStringBaseLength + windSpeed * 10;

  // Calculate the kite's position based on the wind direction and noise
  const kiteX = realCursor.x + wind.x;
  const kiteY = realCursor.y + wind.y;

  // Apply the kite's position with a lerp to smooth out the movement
  cursorX = lerp(cursorX, kiteX, delay);
  cursorY = lerp(cursorY, kiteY, delay);

  cursor.style.left = `${cursorX - 15}px`;
  cursor.style.top = `${cursorY - 15}px`;

  // Draw the string (line) connecting the real cursor and the kite cursor

  drawString(realCursor.x, realCursor.y, cursorX, cursorY, stringLength);
  // console.log(cursorX, cursorY, realCursor.x, realCursor.y, stringLength);

  requestAnimationFrame(updateCursor);
}

function drawString(startX, startY, endX, endY, length) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = '#000'; // String color
  ctx.lineWidth = 1; // String thickness
  ctx.stroke();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Call this function to set the initial size
resizeCanvas();

// Also call this function whenever the window is resized
window.addEventListener('resize', resizeCanvas);

/////////////////////////api stuff down here

document.getElementById('weatherForm').addEventListener('submit', function (event) {
  drawState = true;

  event.preventDefault();

  const location = this.location.value;
  fetch('/getWeather', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location }),
  })
    .then((response) => response.json())
    .then((data) => {
      displayWeatherData(data);
    })
    .catch((error) => console.error('Error:', error));
});

function displayWeatherData(data) {
  // Update your page with the weather data
  // For example:
  const resultDiv = document.getElementById('weatherResult');
  resultDiv.innerHTML = `
      <p>Location: ${data.location.name}, ${data.location.region}</p>
      <p>Temperature: ${data.current.temp_c}°C</p>
  `;
  windSpeed = data.current.wind_kph; // Adjust according to the API response format
  windDirection = data.current.wind_degree; // Adjust according to the API response format
  gustSpeed = data.current.gust_kph; // Adjust according to the API response format

  windResult.innerHTML =
    'Wind Speed:' +
    windSpeed +
    ' km/h' +
    '<br>' +
    'Wind Direction:' +
    windDirection +
    '°' +
    '<br>' +
    'Gust Speed:' +
    gustSpeed +
    ' km/h';
}

// Fetch weather data initially and then every 10 minutes
// fetchWeatherData();
// setInterval(fetchWeatherData, 600000); // 600000 milliseconds = 10 minutes

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    document.getElementById('location').innerHTML = 'Geolocation is not supported by this browser.';
  }
}

function showPosition(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  var location = lat + ',' + lon;

  fetch('/getWeather', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location }),
  })
    .then((response) => response.json())
    .then((data) => {
      displayWeatherData(data);
    })
    .catch((error) => console.error('Error:', error));
  drawState = true;
  document.getElementById('location').innerHTML = '<br>Latitude: ' + lat + '<br>Longitude: ' + lon;
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      document.getElementById('location').innerHTML = 'User denied the request for Geolocation.';
      break;
    case error.POSITION_UNAVAILABLE:
      document.getElementById('location').innerHTML = 'Location information is unavailable.';
      break;
    case error.TIMEOUT:
      document.getElementById('location').innerHTML = 'The request to get user location timed out.';
      break;
    case error.UNKNOWN_ERROR:
      document.getElementById('location').innerHTML = 'An unknown error occurred.';
      break;
  }
}

// linearly maps value from the range (a..b) to (c..d)
function mapRange(value, a, b, c, d) {
  // first map value from (a..b) to (0..1)
  value = (value - a) / (b - a);
  // then map it from (0..1) to (c..d) and return it
  return c + value * (d - c);
}

updateCursor();
