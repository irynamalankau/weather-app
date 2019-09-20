const city = document.querySelector("#city");
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
if (navigator.geolocation) {
    loader.show();
    navigator.geolocation.getCurrentPosition(getWeatherConditions); 
}
else {
    var err_message = "Sorry, but Geolocation is not supported for this Browser version";
    displayError(err);
}

//fetch weather conditions based on location

function getWeatherConditions(position){
    const longitude = position.coords.longitude;
    const latitude = position.coords.latitude;

    //add proxy for ability to see fetched data in localhost
    const proxy = "https://cors-anywhere.herokuapp.com/";
    const api = `${proxy}https://api.darksky.net/forecast/35d8377a47189b5d7d7b190eb4f552b8/${latitude},${longitude}`;

    fetch(api)
        .then(response =>{
            return response.json();
        })
        .then(data =>{
            console.log(data)
            loader.hide();
            //check if the returned object contains data
            if(Object.keys(data).length !==0){
                const {temperature, summary, icon} = data.currently;
                const {temperatureMax, temperatureMin} = data.daily.data[0];
                const timezone = data.timezone;
                const dailyData = data.daily.data;
                //set current conditions
                setCurrentConditions(timezone, temperature, temperatureMax, temperatureMin, summary, icon);
                
                //set extra days
                setExtraDays(dailyData);
                toggleExtraDays();
                toggleDegree();
                
            }
        });   
}
//function for setting current conditions
function setCurrentConditions(timezone, temperature, temperatureMax, temperatureMin, summary, icon){
    city.textContent = timezone.substring(timezone.indexOf("/")+1);
    currentTemp.textContent = Math.round(temperature)+"&deg";
    currentMaxMinTemp.textContent = `${Math.round(temperatureMax)} | ${Math.round(temperatureMin)}`
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
    for (let extraDay=1; extraDay<4; extraDay++){
        //set the day name
        document.querySelector(`#day${extraDay}`).textContent = extraDaysNames[extraDay-1];
        //set the extra day icon
        setIcons(dailyData[extraDay].icon, document.querySelector(`#day${extraDay}_icon`));
        //set the min/max temp for the extra day
        document.querySelector(`#day${extraDay}-maxMinTemp`).textContent = `${Math.round(dailyData[extraDay].temperatureMax)} | ${Math.round(dailyData[extraDay].temperatureMin)}`
    }
         
}

//function returns an array of extra days (names)
function getWeekDay(){
    const weekdayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const extraDaysArray = [];
    const daysNumber = 3;
    let daysCounter;
    for (daysCounter = 1; daysCounter <= daysNumber; daysCounter++){
        let day = new Date((new Date()).valueOf() + 1000*60*60*24*daysCounter).getDay();
        extraDaysArray.push(weekdayArray[day]);
    }
    return(extraDaysArray);
}


//functionality for toggling extra days visibility
function toggleExtraDays(){
    extraDaysBlock.style.visibility = "hidden";
    toggleExtraDaysBtn.addEventListener("click", function(){
        if(toggleExtraDaysBtn.textContent === "Show More") {
            toggleExtraDaysBtn.textContent = "Show Less";
            extraDaysBlock.style.visibility = "visible";
            console.log("work");
        } else{
            toggleExtraDaysBtn.textContent = "Show More";
            extraDaysBlock.style.visibility = "hidden";
        }
    })
}

function toggleDegree(){
    toggleDegreeBtn.addEventListener("click", ()=>{
        (toggleDegreeBtn.textContent === "F")?
            toggleDegreeBtn.textContent = "C": toggleDegreeBtn.textContent = "F"
        })
}

function convertionToCelsius(temperatureF){
    return Math.round((temperatureF-32)/1.8)
}
