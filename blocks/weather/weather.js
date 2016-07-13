import _ from 'lodash';

import './weather-popup.css';
import './weather-widget.css';

import storage from '../utils/storage';
import utils from '../utils/utils';

const WEATHER_STORAGE_KEY = 'forecast-data';
const POSITION_STORAGE_KEY = 'position-data';

const WEATHER_API_URL = "http://gettab1.site:8210/w";
const GEOCODE_API_URL = 'http://gettab1.site:8210/g';

const WEATHER_STORAGE_TIME = 10 * 60 * 1000;
const POSITION_STORAGE_TIME = 10 * 60 * 1000;

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

        Promise.resolve()
            .then(() => this._getPosition())
            .then(position => {
                this.latitude = position.latitude;
                this.longitude = position.longitude;
                return Promise.all([this._getForecast(), this._getCityName()]);
            })
            .then(result => {
                const forecast = result[0];
                const cityName = result[1];

                this.$temp.html(this._getConvertedTemp(forecast.currently.apparentTemperature));
                this.$status.html(forecast.currently.summary);
                this.$city.html(cityName);
                this.$time.html(this._getDate());

                this._setInited();
            });

    }

    _setInited() {
        this.$widget.addClass('weather-widget_inited');
    }


    _getPosition() {

        return storage.get(POSITION_STORAGE_KEY)
            .then(position => {
                console.log('position', position);
                if (position) {
                    console.log('return cached position data');
                    return position;
                } else {
                    return new Promise(resolve => {
                        var geoSuccess = (position) => {
                            const coords = utils.cloneAsObject(position.coords);
                            console.log('got position', position);
                            storage.set(POSITION_STORAGE_KEY, coords, POSITION_STORAGE_TIME)
                                .then(() => resolve(coords));
                        };
                        navigator.geolocation.getCurrentPosition(geoSuccess);
                    });
                }
            });
    }

    _getForecast() {

        const cachedWeatherData = storage.get(WEATHER_STORAGE_KEY);

        return cachedWeatherData
            .then(cachedData => {
                if (cachedData) {
                    console.log('return cached weather data');
                    return cachedData;
                } else {
                    const coordString = [this.latitude, this.longitude].join(',');
                    const apiUrl = `${WEATHER_API_URL}?coord=${coordString}`;

                    return $.ajax(apiUrl)
                        .then(data => storage.set(WEATHER_STORAGE_KEY, data, WEATHER_STORAGE_TIME));
                }
            });

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