import _ from 'lodash';

import './weather-popup.css';
import './weather-widget.css';

const STORAGE_KEY = 'forecast-data';
const WEATHER_API_URL = "http://gettab1.site:8210/w";
const GEOCODE_API_URL = 'http://gettab1.site:8210/g';

const MYSTART_WEATHER_API = 'https://www.mystart.com/api/weather/';

const STORAGE_TIME = 10 * 60 * 1000;

class Weather {
    constructor() {

        this._init();

        this.$widget = $(".weather-widget");
        this.$temp = $(".weather-widget__temp");
        this.$city = $(".weather-widget__city");
        this.$time = $(".weather-widget__time");
        this.$icon = $(".weather-widget__weather-icon");
        this.$status = $(".weather-widget__weather-status");

    }

    _init() {



    }

    _loadDataMystart() {
        Promise.resolve()
            .then(() => this._getMystartData())
            .then(data => {
                this.latitude = data.location.latitude;
                this.longitude = data.location.longitude;

                this._renderWidget(
                    data.now.feelsLike,
                    data.location.city,
                    data.forecast[0].shortDescription
                );
            });

    }

    _loadDataNative() {
        Promise.resolve()
            .then(() => this._getPosition())
            .then(position => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                return Promise.all([this._getForecast(), this._getCityName()]);
            })
            .then(result => {
                const forecast = result[0];
                const cityName = result[1];

                this._renderWidget(
                    this._getConvertedTemp(forecast.currently.apparentTemperature),
                    cityName,
                    forecast.currently.summary
                );

                this._setInited();
            });
    }

    _renderWidget(currentTemp, cityName, weatherSummary) {
        this.$temp.html(currentTemp);
        this.$status.html(weatherSummary);
        this.$city.html(cityName);
        this.$time.html(this._getDate());
    }

    _setInited() {
        this.$widget.addClass('weather-widget_inited');
    }

    _getPosition() {
        return new Promise(resolve => {
            var geoSuccess = (position) => {
                resolve(position);
            };
            navigator.geolocation.getCurrentPosition(geoSuccess);
        });
    }

    _getForecast() {

        if (localStorage.getItem(STORAGE_KEY)) {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            const {timestamp} = data;

            if ((Date.now() - timestamp) < STORAGE_TIME) {
                console.log('return cached weather data');
                return Promise.resolve(data.forecast);
            }
        }

        const coordString = [this.latitude, this.longitude].join(',');
        const apiUrl = `${WEATHER_API_URL}?coord=${coordString}`;

        return $.ajax(apiUrl).then(data => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                timestamp: Date.now(),
                forecast: data
            }));
            return data;
        });
    }

    _getMystartData() {
        return $.ajax(MYSTART_WEATHER_API);
    }

    _getConvertedTemp(temp) {
        return `${Math.round(parseFloat(temp))}°C`;
    }

    _getCityName() {
        const coords = [this.longitude, this.latitude].join(',');
        const geocodeUrl = `${GEOCODE_API_URL}?coord=${coords}`;

        return $.ajax(geocodeUrl).then(response => {
            return _.get(response, 'response.GeoObjectCollection.featureMember[0].GeoObject.name');
        });
    }

    _getDate() {
        const monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

        const d = new Date();

        const monthIndex = d.getMonth();
        const monthName = monthNames[monthIndex];
        const dayIndex = d.getDay();
        const dayName = dayNames[dayIndex];

        return `${d.getHours()}:${d.getMinutes()} ${dayName}, ${monthName} ${d.getDate()}, `
    }


}

const weather = new Weather();