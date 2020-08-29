var userFormEl = document.getElementById("city-form");
var clearCities = document.getElementById("clear-cities");
var cityInputEl = document.getElementById("city");
var cities = [];

var formSubmitHandler = function (event) {
    event.preventDefault();

    var city = cityInputEl.value.trim();
    city = city.toLowerCase();

    if (city) {
        // if user has searched for city before return true
        var foundCity = cities.find(function (ele) {
            if (ele === city) {
                return true;
            }
        });

        // if the user has searched for the city before alert them
        if (foundCity) {
            alert("This city is already in your search history.");
        }
        // if not, proceed with creating the dashboard
        else {
            getCityWeather(city);
            cities.push(city);
            saveCity(cities);
            cityInputEl.value = "";

            // each time a city is typed, show it below the search
            let left = document.getElementById("left");
            let savedCity = document.createElement("h4");
            savedCity.id = city;
            savedCity.textContent = city;
            savedCity.addEventListener("click", function () {
                getCityWeather(city);
            });

            left.appendChild(savedCity);
        }
    } else {
        alert("Please enter a city.");
    }
}

// save off to local storage
var saveCity = function (cities) {
    localStorage.setItem("cities", JSON.stringify(cities));
}

// load from local storage
var loadCity = function () {

    if (localStorage.length === 0) {
        console.log("there is nothing in local storage");
    } else {
        cities = JSON.parse(localStorage.getItem("cities"));

        for (let i = 0; i < cities.length; i++) {
            let left = document.getElementById("left");
            let savedCity = document.createElement("h4");
            savedCity.id = cities[i];
            savedCity.textContent = cities[i];
            savedCity.addEventListener("click", function () {
                getCityWeather(cities[i]);
            })

            left.appendChild(savedCity);
        }
    }
}

// get city weather info from API
var getCityWeather = function (city) {
    var split = city.split(", ");

    var apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + split[0] + "," + split[1] + ",us&APPID=9bd97a1e4e2ce11a400f45a23f05b226";

    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data);
                    displayWeather(city, data);
                });
            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            alert("Unable to connect to OpenWeather");
        });
}

var displayWeather = function (cityState, weather) {
    var weatherContainer = document.getElementById("weather-container");

    weatherContainer.textContent = "";

    // convert today's date from "YYYY-MM-DD" to "MM-DD-YYYY"
    var todaysDate = weather.list[0].dt_txt;
    todaysDate = todaysDate.split(" ");
    todaysDate = todaysDate[0];
    todaysDate = todaysDate.split("-");
    todaysDate = todaysDate[1] + "-" + todaysDate[2] + "-" + todaysDate[0];

    // get weather icon
    var weatherIcon = weather.list[0].weather[0].icon;
    weatherIcon = "http://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";

    // convert today's temp from Kelvin to Fahrenheit
    var todaysTemp = weather.list[0].main.temp;
    var todaysFahrenheit = (todaysTemp - 273.15) * (9 / 5) + 32;
    todaysFahrenheit = todaysFahrenheit.toFixed(2);
    todaysFahrenheit = "Temperature: " + todaysFahrenheit + " °F";

    // --------------- create today's weather card ---------------
    // parent card element
    var todayCard = document.createElement("div");
    todayCard.classList = "card";
    weatherContainer.appendChild(todayCard);

    // today's weather header and image
    var cityStateDate = document.createElement("h2");
    var weatherIconImage = document.createElement("img");
    weatherIconImage.setAttribute("src", weatherIcon);

    var combined = cityState + " (" + todaysDate + ")";
    cityStateDate.textContent = combined;
    cityStateDate.classList = "card-header";
    cityStateDate.appendChild(weatherIconImage);
    todayCard.appendChild(cityStateDate);

    // today's weather temp
    var todayTemp = document.createElement("p");
    todayTemp.textContent = todaysFahrenheit;
    todayCard.appendChild(todayTemp);

    // today's humidity
    var todayHumidity = document.createElement("p");
    todayHumidity.textContent = "Humidity: " + weather.list[0].main.humidity + "%";
    todayCard.appendChild(todayHumidity);

    // today's wind speed
    var todayWind = document.createElement("p");
    todayWind.textContent = "Wind Speed: " + weather.list[0].wind.speed + " MPH";
    todayCard.appendChild(todayWind);

    // fetch and post UV index
    var lat = weather.city.coord.lat;
    var lon = weather.city.coord.lon;
    var apiUrl = "http://api.openweathermap.org/data/2.5/uvi?appid=9bd97a1e4e2ce11a400f45a23f05b226&lat=" + lat + "&lon=" + lon;

    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    // post UV index
                    var uvIndexValue = data.value;

                    var uvIndex = document.createElement("p");
                    var uvSpan = document.createElement("span");
                    uvSpan.textContent = uvIndexValue;
                    if (uvIndexValue < 4) {
                        uvSpan.classList = "favorable";
                    } else if (uvIndexValue < 7) {
                        uvSpan.classList = "moderate";
                    } else {
                        uvSpan.classList = "severe"
                    }
                    uvIndex.textContent = "UV Index: ";
                    uvIndex.appendChild(uvSpan);
                    todayCard.appendChild(uvIndex);
                });
            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            alert("Unable to connect to OpenWeather");
        });

    // --------------- create 5-day weather card ---------------
    // parent card element
    var forecastCard = document.createElement("div");
    forecastCard.classList = "card";
    weatherContainer.appendChild(forecastCard);

    // forecast header
    var forecast = document.createElement("h2");
    forecast.textContent = "5-Day Forecast";
    forecast.classList = "card-header";
    forecastCard.appendChild(forecast);

    // create forecast container
    var forecastContainer = document.createElement("div");
    forecastContainer.classList = "container";
    forecastCard.appendChild(forecastContainer);

    // create forecast row
    var forecastRow = document.createElement("div");
    forecastRow.classList = "row justify-content-between";
    forecastContainer.appendChild(forecastRow);

    // create each forecast day
    for (let i = 1; i < 41; i = i + 8) {
        // format date like above
        let forecastDate = weather.list[i].dt_txt;
        forecastDate = forecastDate.split(" ");
        forecastDate = forecastDate[0];
        forecastDate = forecastDate.split("-");
        forecastDate = forecastDate[1] + "-" + forecastDate[2] + "-" + forecastDate[0];

        // create container for each day in 5-day forecast
        let dayCol = document.createElement("div");
        dayCol.classList = "col-xl-2 col-lg-6 col-12 day-color";
        forecastRow.appendChild(dayCol);

        // create date header
        let dateHeader = document.createElement("h3");
        dateHeader.textContent = forecastDate;
        dayCol.appendChild(dateHeader);

        // create weather icon
        let weatherIcon = weather.list[i].weather[0].icon;
        weatherIcon = "http://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";

        let weatherIconImage = document.createElement("img");
        weatherIconImage.setAttribute("src", weatherIcon);

        dayCol.appendChild(weatherIconImage);

        // convert and create temp
        let todaysTemp = weather.list[i].main.temp;
        let todaysFahrenheit = (todaysTemp - 273.15) * (9 / 5) + 32;
        todaysFahrenheit = todaysFahrenheit.toFixed(2);
        todaysFahrenheit = "Temp: " + todaysFahrenheit + " °F";

        let todayTemp = document.createElement("p");
        todayTemp.textContent = todaysFahrenheit;
        dayCol.appendChild(todayTemp);

        // create humidity
        let todayHumidity = document.createElement("p");
        todayHumidity.textContent = "Humidity: " + weather.list[i].main.humidity + "%";
        dayCol.appendChild(todayHumidity);
    }
}

// clear local storage and refresh page
var clearCitiesHandler = function () {
    localStorage.clear();
    location.reload();
}

loadCity();
userFormEl.addEventListener("submit", formSubmitHandler);
clearCities.addEventListener("click", clearCitiesHandler);