let weatherData = {};
let dailyData = {};
let isFahrenheit = true;

const content = document.querySelector("#content");
const error = document.querySelector("#error");
const loading = document.querySelector("#loader");
const currentIcon = document.querySelector("#current_icon");
const currentTemp = document.querySelector("#current-temperature");
const currentMaxMinTemp = document.querySelector("#current-maxMin-temp");
const currentSummary = document.querySelector("#current-summary");
const toggleExtraDaysBtn = document.querySelector("#toggleExtraDays");
const extraDaysBlock = document.querySelector("#extraDays");
const toggleDegreeBtn = document.querySelector("#toggleDegree");


//create 2 states for loader
const loader = {
    show: function () {
        document.querySelector("#loader").style.display = 'block';
    },
    hide: function () {
        document.querySelector("#loader").style.display = 'none';
    }
}

function handleErrors(response) {
    if (!response.ok) {
        error.textContent = "Opps... Something went wrong. Try to reload.";
        loading.style.visibility = "hidden";
        throw Error(response.statusText);
    }
    return response.json();
}

loader.show();
getWeatherConditions();

function getWeatherConditions() {
    //Set Chicago lat and long
    const longitude = -87.6298;
    const latitude = 41.8781;
    //add proxy for ability to see fetched data in localhost
    const proxy = "https://cors-anywhere.herokuapp.com/";
    const api = `${proxy}https://api.darksky.net/forecast/35d8377a47189b5d7d7b190eb4f552b8/${latitude},${longitude}`;

    fetch(api)
        .then(handleErrors)
        .then(data => {
            console.log(data)
            loader.hide();
            //check if the returned object contains data
            if (Object.keys(data).length !== 0) {

                const { temperature, summary, icon } = data.currently;
                //initialize dalily data object
                dailyData = data.daily.data;
                const { temperatureMax, temperatureMin } = dailyData[0];

                //initialize current conditions object
                weatherData = {
                    temperature: temperature,
                    summary: summary,
                    temperatureMax: temperatureMax,
                    temperatureMin: temperatureMin,
                    icon: icon,
                }

                setWeatherDescription(weatherData);
                setTemperatureConditions(weatherData);
                setExtraDays(dailyData);
                setTempExtraDays(dailyData);
                handleExtraDaysSection();
                changeDegreeButtonContext();
            }
        })
        .catch(error => console.log(error));
}

//function for setting current weather conditions description (icon and summary)
function setWeatherDescription(data) {
    content.style.visibility = "visible";
    toggleDegreeBtn.style.visibility = "visible";
    currentSummary.textContent = data.summary;
    //set icon
    setIcons(data.icon, document.querySelector("#current-icon"));
}

function setTemperatureConditions(data) {
    currentTemp.textContent = currentUnitsTemp(data.temperature);
    currentMaxMinTemp.textContent = maxMinTemp(data.temperatureMax, data.temperatureMin);
}


//function for creating icons
function setIcons(icon, iconID) {
    const skycons = new Skycons({ "color": "white" });
    const modifiedIconName = icon.replace(/-/g, "_").toUpperCase();
    skycons.play();
    return skycons.set(iconID, Skycons[modifiedIconName])
}

//function for setting extra days weather description (icon and summary)
function setExtraDays(dailyData) {
    const extraDaysNames = getWeekDay();
    console.log(extraDaysNames);
    for (let extraDay = 0; extraDay < 3; extraDay++) {
        let dayIndexInHtml = extraDay + 1;
        let dayData = dailyData[extraDay + 1];
        //set the day name
        document.querySelector(`#day${dayIndexInHtml}`).textContent = extraDaysNames[extraDay];
        //set the extra day icon
        setIcons(dayData.icon, document.querySelector(`#day${dayIndexInHtml}_icon`));
    }

}
//set the min/max temp for extra days
function setTempExtraDays(dailyData) {
    for (let extraDay = 0; extraDay < 3; extraDay++) {
        let dayIndexInHtml = extraDay + 1;
        let dayData = dailyData[extraDay + 1];
        document.querySelector(`#day${dayIndexInHtml}-maxMinTemp`).textContent =
            maxMinTemp(dayData.temperatureMax, dayData.temperatureMin);
    }
}

//function returns an array of extra days (names)
function getWeekDay() {
    const weekdayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const extraDaysArray = [];
    const daysNumber = 3;
    let daysCounter;
    //dayOfset = 1000ms* 60min* 60sec* 24hours
    const dayOfset = 1000 * 60 * 60 * 24;
    for (daysCounter = 0; daysCounter < daysNumber; daysCounter++) {
        let dayNumber = daysCounter + 1;
        let day = new Date((new Date()).valueOf() + dayOfset * (dayNumber)).getDay();
        extraDaysArray.push(weekdayArray[day]);
    }
    return (extraDaysArray);
}

//functionality for toggling extra days visibility
function handleExtraDaysSection() {
    extraDaysBlock.style.visibility = "hidden";
    toggleExtraDaysBtn.addEventListener("click", function () {
        if (toggleExtraDaysBtn.textContent === "Next 3 Days") {
            toggleExtraDaysBtn.textContent = "Show Less";
            extraDaysBlock.style.visibility = "visible";
        } else {
            toggleExtraDaysBtn.textContent = "Next 3 Days";
            extraDaysBlock.style.visibility = "hidden";
        }
    })
}

function changeDegreeButtonContext() {
    toggleDegreeBtn.addEventListener("click", () => {
        if (isFahrenheit) {
            isFahrenheit = false;
            toggleDegreeBtn.textContent = "C";
            setTemperatureConditions(weatherData);
            setTempExtraDays(dailyData)

        } else {
            isFahrenheit = true;
            toggleDegreeBtn.textContent = "F";
            setTemperatureConditions(weatherData);
            setTempExtraDays(dailyData);
        }
    })
}

function currentUnitsTemp(temp) {
    let tempCelsius = (temp - 32) / 1.8;
    let temprature = (isFahrenheit) ? temp : tempCelsius;
    let tempRounded = Math.round(temprature);
    return tempRounded + "\xB0"
}

function maxMinTemp(tempMax, tempMin) {
    return `${currentUnitsTemp(tempMax)} | ${currentUnitsTemp(tempMin)}`
}
