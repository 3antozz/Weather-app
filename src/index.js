import "./styles.css";

(function init() {
  let unit = "metric";
  let lastLocation = "Hadjout";
  const button = document.querySelector(".search");
  const unitButton = document.querySelector(".unit");
  const icons = loadIcons();
  const allIcons = icons.getIcons();
  const loading = document.querySelector(".loading");
  loading.classList.add("visible");
  getWeather(allIcons, "Hadjout", unit);
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    const input = document.querySelector("#location");
    if (input.value === "") {
      alert("Please enter a location!");
    } else {
      loading.classList.add("visible");
      const location = await getWeather(allIcons, input.value, unit);
      if (location) {
        lastLocation = location;
        input.value = "";
      }
    }
  });

  unitButton.addEventListener("click", () => {
    loading.classList.add("visible");
    if (unit === "metric") {
      unit = "us";
      getWeather(allIcons, lastLocation, unit);
      unitButton.textContent = "F°";
    } else {
      unit = "metric";
      getWeather(allIcons, lastLocation, unit);
      unitButton.textContent = "C°";
    }
  });

  const root = document.documentElement;

  const themeButton = document.querySelector(".switch-theme");

  themeButton.addEventListener("click", () => {
      if (root.className === "light") {
          root.className = "dark";
      }
      else {
          root.className = "light";
      }
  })
})();

function loadIcons() {
  const icons = {};
  // eslint-disable-next-line no-undef
  const requireContext = require.context("./icons", false, /\.svg$/);
  requireContext.keys().forEach((fileName) => {
    const iconKey = fileName.replace("./", "").replace(".svg", "");
    icons[iconKey] = requireContext(fileName);
  });

  const getIcons = () => icons;

  return { getIcons };
}

async function getWeather(icons, location, unit) {
  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next7days?unitGroup=${unit}&key=ZRFF4ZA52KPV7H6SNGMSTNB3K`,
      { mode: "cors" },
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP error! status: ${errorMessage}`);
    }
    const weatherData = await response.json();
    console.log(weatherData);
    const neededData = extractNeededData(weatherData);
    const todayIcon = icons[`${neededData.currentConditions.icon}`];
    clearDivs();
    displayTodayWeather(todayIcon, neededData, unit);
    neededData.days.forEach((day) => {
      const weatherIcon = icons[`${day.icon}`];
      displayNextDaysWeather(weatherIcon, day, unit);
    });
    return location;
  } catch  {
    alert("Error! Location not found!");
  } finally {
    const loading = document.querySelector(".loading");
    loading.classList.remove("visible");
  }
}

function clearDivs() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.remove();
  });
  const today = document.querySelector(".today");
  today.textContent = "";
}

function displayTodayWeather(icon, data, unit) {

  let UNIT;
  if (unit === "us") {
    UNIT = "F°"
  } else {
    UNIT = "C°"
  }
  const todayDiv = document.querySelector(".today");

  const location = document.createElement("h1");
  location.textContent = data.address;

  const underLocationDiv = document.createElement("div");
  underLocationDiv.classList.add("under");

  const imgDiv = document.createElement("div");
  imgDiv.classList.add("left");

  const img = document.createElement("img");
  img.src = icon;

  const condition = document.createElement("h2");
  condition.textContent = data.currentConditions.conditions;

  const rightDiv = document.createElement("div");
  rightDiv.classList.add("right");

  const date = document.createElement("h2");
  date.textContent = "Now";
  date.classList.add("now");


  const temp = document.createElement("h2");
  temp.textContent = `${data.currentConditions.temperature} ${UNIT}`;
  temp.classList.add("today-temp");

  const humidity = document.createElement("h3");
  humidity.textContent = `Humidity: ${data.currentConditions.humidity}%`;

  imgDiv.append(img, condition);
  rightDiv.append(date, temp, humidity);
  underLocationDiv.append(imgDiv, rightDiv);

  todayDiv.append(location, underLocationDiv);
}

function displayNextDaysWeather(icon, dayData, unit) {
  let UNIT;
  if (unit === "us") {
    UNIT = "F°"
  } else {
    UNIT = "C°"
  }
  const daysDiv = document.querySelector(".days");

  const dayDiv = document.createElement("div");
  dayDiv.classList.add("day");

  const img = document.createElement("img");
  img.src = icon;

  const date = document.createElement("h3");
  date.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(new Date(dayData.date));

  const condition = document.createElement("h4");
  condition.textContent = dayData.conditions;

  const tempDiv = document.createElement("div");

  const maxTemp = document.createElement("p");
  maxTemp.textContent = `${dayData.tempmax} ${UNIT}`;
  maxTemp.classList.add("max-temp");

  const minTemp = document.createElement("p");
  minTemp.textContent = ` ${dayData.tempmin} ${UNIT}`;
  minTemp.classList.add("min-temp");
  
  const humidity = document.createElement("h4");
  humidity.textContent = `Humidity: ${dayData.humidity}%`;

  tempDiv.append(maxTemp, minTemp);
  dayDiv.append(img, date, condition, tempDiv, humidity);
  daysDiv.appendChild(dayDiv);
}

function extractNeededData(weatherData) {
  const days = weatherData.days
    .slice(1)
    .map(
      ({
        conditions,
        datetime,
        humidity,
        icon,
        temp,
        feelslike,
        tempmax,
        tempmin,
      }) => ({
        conditions,
        date: datetime,
        humidity: Math.round(humidity),
        icon,
        temp: Math.round(temp),
        feelslike,
        tempmax: Math.round(tempmax),
        tempmin: Math.round(tempmin),
      }),
    );
  const neededData = {
    address: weatherData.resolvedAddress,
    currentConditions: {
      conditions: weatherData.currentConditions.conditions,
      feels: Math.round(weatherData.currentConditions.feelslike),
      humidity: Math.round(weatherData.currentConditions.humidity),
      icon: weatherData.currentConditions.icon,
      temperature: Math.round(weatherData.currentConditions.temp),
    },
    days: days,
  };
  console.log(neededData);
  return neededData;
}
