//const city = document.querySelector("#city");
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
    show: function(){
        document.querySelector("#loader").style.display = 'block';
    },
    hide: function(){
        document.querySelector("#loader").style.display = 'none';
    }
}

// check for Geolocation support
// if (navigator.geolocation) {
//     loader.show();
//     navigator.geolocation.getCurrentPosition(getWeatherConditions); 
// }
// else {
//     var err_message = "Sorry, but Geolocation is not supported for this Browser version";
//     displayError(err);
// }

//fetch weather conditions based on location
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


function getWeatherConditions(){
    //Set Chicago lat and long
    const longitude = -87.6298;
    const latitude = 41.8781;
    console.log(longitude);
    console.log(latitude);
    //add proxy for ability to see fetched data in localhost
    const proxy = "https://cors-anywhere.herokuapp.com/";
    const api = `${proxy}https://api.darksky.net/forecast/35d8377a47189b5d7d7b190eb4f552b8/${latitude},${longitude}`;

    fetch(api)
        .then(handleErrors)
        .then(data =>{
            console.log(data)
            loader.hide();
            //check if the returned object contains data
            if(Object.keys(data).length !==0){
                const {temperature, summary, icon} = data.currently;
                const {temperatureMax, temperatureMin} = data.daily.data[0];
                //const timezone = data.timezone;
                const dailyData = data.daily.data;
                //set current conditions
                setCurrentConditions(temperature, temperatureMax, temperatureMin, summary, icon);
                
                //set extra days
                setExtraDays(dailyData);
                toggleExtraDays();
                toggleDegree(temperature, temperatureMax, temperatureMin, dailyData);    
            }
        })
        .catch(error=> console.log(error));   
}


//function for setting current conditions
function setCurrentConditions(temperature, temperatureMax, temperatureMin, summary, icon){
    //city.textContent = timezone.substring(timezone.indexOf("/")+1);
    content.style.visibility = "visible";
    toggleDegreeBtn.style.visibility = "visible";
    currentTemp.textContent = Math.round(temperature)+"\xB0";
    currentMaxMinTemp.textContent = `${Math.round(temperatureMax)+"\xB0"} | ${Math.round(temperatureMin)+"\xB0"}`;
    currentSummary.textContent = summary;
    //set icon
    setIcons(icon, document.querySelector("#current-icon"));
} 
//function for creating icons
function setIcons(icon, iconID){
    const skycons = new Skycons({"color": "white"});
    const modifiedIconName = icon.replace(/-/g, "_").toUpperCase();
    skycons.play();
    return skycons.set(iconID, Skycons[modifiedIconName])
}

//function for setting extra days
function setExtraDays(dailyData){
    const extraDaysNames = getWeekDay();
    console.log(extraDaysNames);
    for (let extraDay=1; extraDay<=3; extraDay++){
        //set the day name
        document.querySelector(`#day${extraDay}`).textContent = extraDaysNames[extraDay-1];
        //set the extra day icon
        setIcons(dailyData[extraDay].icon, document.querySelector(`#day${extraDay}_icon`));
        //set the min/max temp for the extra day
        document.querySelector(`#day${extraDay}-maxMinTemp`).textContent = `${Math.round(dailyData[extraDay].temperatureMax)+"\xB0"} | ${Math.round(dailyData[extraDay].temperatureMin)+"\xB0"}`
    }
         
}

//function returns an array of extra days (names)
function getWeekDay(){
    const weekdayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const extraDaysArray = [];
    const daysNumber = 3;
    let daysCounter;
    const dayOfset = 1000*60*60*24
    for (daysCounter = 1; daysCounter <= daysNumber; daysCounter++){
        let day = new Date((new Date()).valueOf() + dayOfset*daysCounter).getDay();
        extraDaysArray.push(weekdayArray[day]);
    }
    return(extraDaysArray);
}


//functionality for toggling extra days visibility
function toggleExtraDays(){
    extraDaysBlock.style.visibility = "hidden";
    toggleExtraDaysBtn.addEventListener("click", function(){
        if(toggleExtraDaysBtn.textContent === "Next 3 Days") {
            toggleExtraDaysBtn.textContent = "Show Less";
            extraDaysBlock.style.visibility = "visible";
        } else{
            toggleExtraDaysBtn.textContent = "Next 3 Days";
            extraDaysBlock.style.visibility = "hidden";
        }
    })
}

function toggleDegree(temperature, temperatureMax, temperatureMin, dailyData){
    toggleDegreeBtn.addEventListener("click", ()=>{
        if (toggleDegreeBtn.textContent === "F") {
            toggleDegreeBtn.textContent = "C";
            currentTemp.textContent = convertionToCelsius(temperature)+"\xB0";
            currentMaxMinTemp.textContent = `${convertionToCelsius(temperatureMax)+"\xB0"} | ${convertionToCelsius(temperatureMin)+"\xB0"}`;
            for (let extraDay = 1; extraDay<=3; extraDay++){
                document.querySelector(`#day${extraDay}-maxMinTemp`).textContent = `${convertionToCelsius(dailyData[extraDay].temperatureMax)+"\xB0"} | ${convertionToCelsius(dailyData[extraDay].temperatureMin)+"\xB0"}` 
            }
            
        } else {
            toggleDegreeBtn.textContent = "F";
            currentTemp.textContent = Math.round(temperature)+"\xB0";
            currentMaxMinTemp.textContent = `${Math.round(temperatureMax)+"\xB0"} | ${Math.round(temperatureMin)+"\xB0"}`;
            for (let extraDay = 1; extraDay<=3; extraDay++){
                document.querySelector(`#day${extraDay}-maxMinTemp`).textContent = `${Math.round(dailyData[extraDay].temperatureMax)+"\xB0"} | ${Math.round(dailyData[extraDay].temperatureMin)+"\xB0"}` 
            }
        }
    })       
}

function convertionToCelsius(temperatureF){
    return Math.round((temperatureF-32)/1.8)
}


