import "./reset.css";
import "./output.css";

(function init() {
  const button = document.querySelector(".search");
  const unitButton = document.querySelector(".unit");
  const icons = loadIcons();
  const allIcons = icons.getIcons();
  const loading = document.querySelector(".loading");
  const root = document.documentElement;
  const themeButton = document.querySelector(".switch-theme");
  let unit;
  let lastLocation;
  if (!localStorage || localStorage.length === 0 || !localStorage.lastLocation) {
    unit = "metric";
    lastLocation = "Lithuania";
    loading?.classList.add("flex!");
    getWeather(allIcons, lastLocation, unit);
    updateLocalStorage(lastLocation, unit);
    root.classList.add("light");
  } else {
    if(localStorage.theme) {
      const theme = localStorage.getItem("theme");
      root.classList.add(theme);
    } else {
      root.classList.add("light");
    }
    unit = localStorage.getItem("unit");
    if (unit === "metric") {
      unitButton.textContent = "C°";
    } else {
      unitButton.textContent = "F°";
    }
    lastLocation = localStorage.getItem("lastLocation");
    loading?.classList.add("flex!");
    getWeather(allIcons, lastLocation, unit);
  }

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    const input = document.querySelector("#location");
    if (input.value === "") {
      alert("Please enter a location!");
    } else {
      loading?.classList.add("flex!");
      const location = await getWeather(allIcons, input.value, unit);
      if (location) {
        lastLocation = location;
        input.value = "";
        localStorage.setItem("lastLocation", lastLocation);
      }
    }
  });

  unitButton.addEventListener("click", () => {
    loading?.classList.add("flex!");
    if (unit === "metric") {
      unit = "us";
      getWeather(allIcons, lastLocation, unit);
      unitButton.textContent = "F°";
    } else {
      unit = "metric";
      getWeather(allIcons, lastLocation, unit);
      unitButton.textContent = "C°";
    }
    localStorage.setItem("unit", unit);
  });

  themeButton?.addEventListener("click", () => {
      if (root.className === "light") {
          root.className = "dark";
          localStorage.setItem("theme", "dark");
      }
      else {
          root.className = "light";
          localStorage.setItem("theme", "light");
      }
  })
})();

function updateLocalStorage (location, unit) {
  localStorage.setItem("lastLocation", location);
  localStorage.setItem("unit", unit);
}

function loadIcons() {
  const icons = {};
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
    neededData.days.forEach((day, index) => {
      const weatherIcon = icons[`${day.icon}`];
      displayNextDaysWeather(weatherIcon, day, unit, index);
    });
    return location;
  } catch  {
    alert("Error! Location not found!");
  } finally {
    const loading = document.querySelector(".loading");
    loading?.classList.remove("flex!");
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

  const location = document.createElement("h2");
  location.className = "text-4xl lg:text-5xl mb-8! lg:mb-16! text-shadow-lg px-4"
  location.textContent = data.address;

  const underLocationDiv = document.createElement("div");
  underLocationDiv.classList.add("under", "flex", "flex-col", "gap-8", "sm:gap-10", "items-center");

  const imgDiv = document.createElement("div");
  imgDiv.classList.add("left", "shrink-0", "flex", "items-center", "gap-4", "md:gap-12");

  const img = document.createElement("img");
  img.src = icon;
  img.className = "animate-weather w-[clamp(4rem,_30vw,_10rem)]"
  img.alt = data.currentConditions.conditions;

  const condition = document.createElement("h4");
  condition.textContent = data.currentConditions.conditions;
  condition.className = "text-[clamp(1.2rem,_6vw,_2rem)] text-shadow-lg text-center"

  const rightDiv = document.createElement("div");
  rightDiv.classList.add("right", "flex", "flex-col", "gap-4");

  const date = document.createElement("h3");
  date.textContent = "Now";
  date.classList.add("now", "text-3xl", "text-center", "hidden");


  const temp = document.createElement("h3");
  temp.textContent = `${data.currentConditions.temperature} ${UNIT}`;
  temp.classList.add("today-temp", "text-[clamp(2rem,_18vw,_5rem)]", "text-shadow-lg", "leading-10");

  const humidity = document.createElement("div");
  humidity.className = "text-center";
  const svg = document.createElement("svg");
  svg.className = "w-10 shrink-0"
  svg.innerHTML = `<svg viewBox="110 110 300 300" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="14.8" x2="124.2" y1="42.3" y2="231.7"><stop offset="0" stop-color="#3392d6"/><stop offset=".5" stop-color="#3392d6"/><stop offset="1" stop-color="#2477b2"/></linearGradient><symbol id="b" viewBox="0 0 164 245.6"><path d="m82 3.6c-48.7 72-80 117-80 160.7s35.8 79.3 80 79.3 80-35.5 80-79.3-31.3-88.8-80-160.7z" fill="url(#a)" stroke="#2885c7" stroke-miterlimit="10" stroke-width="4"/></symbol><use height="245.6" transform="translate(173.9 133.01)" width="164" xlink:href="#b"/><path d="m218.8 250.5q4.8-4.5 13.7-4.5t13.6 4.5q4.8 4.4 4.8 12.4v8q0 7.8-4.8 12.2t-13.6 4.4q-9 0-13.7-4.4t-4.8-12.2v-8q0-8 4.8-12.4zm71.2-1.6a2.8 2.8 0 0 1 -.6 2.6l-53 73.3a9.4 9.4 0 0 1 -2.8 2.8 12.3 12.3 0 0 1 -4.6.6h-4.4c-1.3 0-2.1-.4-2.5-1.1a2.8 2.8 0 0 1 .7-2.8l53-73.3a7 7 0 0 1 2.6-2.7 12.7 12.7 0 0 1 4.4-.5h4.9c1.2 0 2 .4 2.3 1.1zm-57.5 7.6q-7.7 0-7.7 7v6.7q0 7 7.7 7t7.7-7v-6.8q0-6.9-7.7-6.9zm33.4 36.4q4.7-4.5 13.7-4.5t13.6 4.5q4.8 4.5 4.8 12.4v8q0 7.8-4.8 12.2t-13.7 4.5q-8.9 0-13.6-4.4t-4.8-12.3v-8q0-8 4.8-12.4zm13.6 6.1q-7.6 0-7.6 7v6.6q0 7 7.6 7t7.7-7v-6.7q0-6.9-7.7-6.9z" fill="#fff"/></svg>`;
  const humidityH4 = document.createElement("h4");
  humidityH4.textContent = `Feels like ${data.currentConditions.feels} C°`;
  humidityH4.className = "text-[clamp(1rem,_5vw,_1.5rem)] text-gray-300!"
  humidity.append(humidityH4);
  imgDiv.append(img, temp);
  rightDiv.append(date, condition, humidity);
  underLocationDiv.append(imgDiv, rightDiv);

  todayDiv.append(location, underLocationDiv);
}

function displayNextDaysWeather(icon, dayData, unit, index = 1) {
  let UNIT;
  if (unit === "us") {
    UNIT = "°"
  } else {
    UNIT = "°"
  }
  const daysDiv = document.querySelector(".days");

  const dayDiv = document.createElement("div");
  dayDiv.classList.add("day", "flex", "gap-4", "lg:gap-8", "items-center");

  const img = document.createElement("img");
  img.src = icon;
  img.className = "w-[clamp(1.8rem,_8vw,_4rem)] shrink-0";
  img.alt = dayData.conditions;

  const date = document.createElement("p");
  date.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(new Date(dayData.date));
  if(index === 0) {
    date.textContent = "Today"
  }
  date.className = "text-[clamp(1.05rem,_3.8vw,_1.4rem)] font-semibold text-left w-18 max-w-40"

  const condition = document.createElement("p");
  condition.textContent = dayData.conditions;
  condition.className = "text-[clamp(1rem,_3.2vw,_1.3rem)] text-left flex-1"

  const tempDiv = document.createElement("div");
  tempDiv.className = "flex gap-1 items-end"

  const maxTemp = document.createElement("p");
  maxTemp.textContent = `${dayData.tempmax}${UNIT}/`;
  maxTemp.classList.add("max-temp", "text-[clamp(1rem,_3vw,_1.3rem)]", "font-semibold");

  const minTemp = document.createElement("p");
  minTemp.textContent = ` ${dayData.tempmin}${UNIT}`;
  minTemp.classList.add("min-temp", "text-[clamp(1rem,_3vw,_1.3rem)]");
  
  const humidityDiv = document.createElement("span");
  humidityDiv.className = "flex items-center gap-1 hidden min-[350px]:flex"
  const humidity = document.createElement("h4");
  const svg = document.createElement("svg");
  svg.className = "w-[clamp(1rem,_3vw,_1.1rem)] shrink-0"
  svg.innerHTML = `<svg class="precip-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 16"><path fill="none" fill-rule="nonzero" stroke="white" stroke-width=".714" d="M5.532.891c1.723.952 5.315 5.477 5.775 8.756.028 1.718-.534 3.101-1.45 4.082C8.888 14.766 7.52 15.357 6 15.357a5.532 5.532 0 0 1-3.74-1.425c-.975-.89-1.587-2.124-1.616-3.49.503-4.035 4.013-8.49 4.888-9.551Zm-1.815 7.33a.336.336 0 0 0-.025.043c-.322.62-.59 1.255-.695 2.207.012.408.143.787.358 1.111.234.352.568.641.96.839.035.017.071.021.106.017a.201.201 0 0 0 .104-.044l.01-.005-.078-.1c-.328-.415-.82-1.067-.82-1.946 0-.752.076-1.613.08-2.121Z"></path></svg>`;
  humidity.textContent = ` ${dayData.humidity}%`;
  humidity.classList.add("text-[clamp(1rem,_3vw,_1.3rem)]");
  humidityDiv.append(svg, humidity);
  tempDiv.append(maxTemp, minTemp);
  dayDiv.append(img, date, condition, tempDiv, humidityDiv);
  daysDiv.appendChild(dayDiv);
}

function extractNeededData(weatherData) {
  const days = weatherData.days
    .toSpliced(weatherData.days.length - 2, 2)
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
