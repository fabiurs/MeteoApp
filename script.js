var city = document.getElementById("city");
var searchButton = document.getElementById("searchCity");
var numeOras = document.getElementById("numeOras");
var numeOras2 = document.getElementById("numeOras2");
var currentTemperature = document.getElementById("currentTemperature");
var forecastTable = document.getElementById("forecastTable");
var btnGetUserLocation = document.getElementById("getUserLocation");
var messageLocation = document.getElementById("locationMessage");
var customRow = document.getElementsByClassName("custom-row");
var currentIcon = document.getElementById("currentIcon");
var currentWeatherText = document.getElementById("conditiontext");


searchButton.addEventListener('click', function () {
    if(city.value.length > 0){
        getWeatherData(city.value);
    }
    else{
        errorInput();
    }
})

city.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
        if(city.value.length > 0){
            getWeatherData(city.value);
        }
        else{
            errorInput();
        }
    }
})

function errorInput(){
    messageLocation.classList.remove("text-success");
    messageLocation.classList.add("text-danger");
    messageLocation.innerHTML = "Nu ai introdus un oras!";
    setTimeout(() => {
        messageLocation.innerHTML = "";
        messageLocation.classList.remove("text-danger");
    }, 3000);
}

btnGetUserLocation.addEventListener('click', function(){
    getLocation();
})

var getWeatherData = async function (cityName) {
    numeOras.innerHTML = cityName;
    numeOras2.innerHTML = cityName;
    var locationResponse = await axios.get(`https://dataservice.accuweather.com/locations/v1/cities/search?apikey=iDAp6VGDtnGdE5xJHG6maAPVkrDFsFQn&q=${cityName}`)
        .then(res => {
            console.log(res.data[0]);
            return res.data[0].Key;
        })
        .catch(err => {
            console.log(err);
        })

    var conditionsResponse = await axios.get(`https://dataservice.accuweather.com//currentconditions/v1/${locationResponse}?apikey=iDAp6VGDtnGdE5xJHG6maAPVkrDFsFQn&language=ro-ro`)
        .then(res => {
            displayIcon(res.data[0].WeatherIcon, res.data[0].WeatherText);
            displayCurrentConditions(res.data[0].Temperature.Metric.Value);
            return res.data[0].Temperature.Metric.Value;
        })
        .catch(err => {
            console.log(err);
        })

    var forecastResponse = await axios.get(`https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationResponse}?apikey=iDAp6VGDtnGdE5xJHG6maAPVkrDFsFQn&metric=true`)
        .then(res => {
            showForecast(res.data.DailyForecasts);
            return res.data.DailyForecasts;
        })
        .catch(err => {
            console.log(err);
        })

    showRow();
}

function displayIconAndText(iconNumber, weatherText){
    let path = "./icons/" + iconNumber + "-s.png";
    currentIcon.src = path;
    currentWeatherText.innerHTML = weatherText;
}

function showRow(){
    for(let i = 0; i < customRow.length; i++){
        customRow[i].classList.add("show");
    }
}

function displayCurrentConditions(temp) {
    currentTemperature.innerHTML = temp;
}

function showForecast(data) {
    var customTable = '';
    var dataCustom;
    data.forEach(el => {
        dataCustom = displayDate(el.Date)
        customTable += `
        <tr>
            <td>${dataCustom} </td>
            <td>${el.Temperature.Minimum.Value} &#8451;</td>
            <td>${el.Temperature.Maximum.Value} &#8451;</td>
        </tr>
        `
    })

    forecastTable.innerHTML = customTable;
}

function displayDate(date) {
    var oldDate = new Date(date);

    var day = oldDate.getDate();
    if (day < 10) day = '0' + day;

    var month = oldDate.getMonth();
    month = Number(month) + 1;
    if (month < 10) month = '0' + month;

    var year = oldDate.getFullYear();

    var customDate = day + '.' + month + '.' + year;

    return customDate;
}

var determineCity = async function(lat, long){
    var forecastResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyBsugSqwhR6Hl5xFMwGS93XHOWI3_tTUqI`)
        .then(res => {
            city.value = res.data.results[0].address_components[2].long_name;
            getWeatherData(res.data.results[0].address_components[2].long_name);
            //showPosition(res.data.results[0].address_components[2].long_name);
            return res.data.results[0].address_components[2].long_name;
        })
        .catch(err => {
            console.log(err);
        })
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(calcPosition, showError);
  } else {
    messageLocation.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function calcPosition(position) {
    messageLocation.classList.remove("text-danger");
    messageLocation.classList.add("text-success");
    determineCity(position.coords.latitude, position.coords.longitude);
}

function showError(error) {
    messageLocation.classList.add("text-danger");
    switch(error.code) {
      case error.PERMISSION_DENIED:
        messageLocation.innerHTML = "Ati refuzat distribuirea locatiei dumneavoastra."
        break;
      case error.POSITION_UNAVAILABLE:
        messageLocation.innerHTML = "Informatiile despre locatia dumneavoastra sunt indisponibile"
        break;
      case error.TIMEOUT:
        messageLocation.innerHTML = "Solicitarea de a obține locația utilizatorului a expirat."
        break;
      case error.UNKNOWN_ERROR:
        messageLocation.innerHTML = "Am intampinat o eroare necunoscută."
        break;
    }
  }
