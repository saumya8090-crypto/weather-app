const apiKey = "3abd9f7c3654308ebbac25632220b966";
let tempChart;

/* SEARCH */
async function getWeather() {
  const city = document.getElementById("search").value.trim();
  if (!city) return;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    if (!res.ok) throw new Error();

    const data = await res.json();
    updateUI(data);
    getForecast(city);

  } catch {
    alert("Error fetching data");
  }
}

/* UI UPDATE */
function updateUI(data) {
  document.getElementById("city").innerText = data.name;
  document.getElementById("temp").innerText = data.main.temp + "°C";
  document.getElementById("desc").innerText = data.weather[0].description;

  document.getElementById("icon").src =
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

/* FORECAST + GRAPH */
async function getForecast(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );

    const data = await res.json();

    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";

    const daily = data.list.filter(item =>
      item.dt_txt.includes("12:00:00")
    );

    let labels = [];
    let temps = [];

    daily.slice(0, 5).forEach(day => {
      const date = new Date(day.dt_txt);

      labels.push(date.toDateString().slice(0, 3));
      temps.push(day.main.temp);

      const div = document.createElement("div");
      div.className = "day";

      div.innerHTML = `
        <h4>${date.toDateString().slice(0, 3)}</h4>
        <p>${day.main.temp}°C</p>
        <p>${day.weather[0].main}</p>
      `;

      forecastDiv.appendChild(div);
    });

    drawChart(labels, temps);

  } catch {
    console.log("Forecast error");
  }
}

/* CHART */
function drawChart(labels, temps) {
  const ctx = document.getElementById("tempChart").getContext("2d");

  if (tempChart) tempChart.destroy();

  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperature (°C)",
        data: temps,
        fill: true,
        tension: 0.4
      }]
    }
  });
}

/* AUTO LOCATION */
navigator.geolocation.getCurrentPosition(async pos => {
  const { latitude, longitude } = pos.coords;

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
  );

  const data = await res.json();
  updateUI(data);
  getForecast(data.name);
});

/* DARK MODE */
const toggle = document.getElementById("themeToggle");

toggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", toggle.checked ? "dark" : "light");
});

/* LOAD THEME */
window.onload = () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggle.checked = true;
  }
};