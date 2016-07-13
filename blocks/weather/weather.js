import './weather-popup.css';
import './weather-widget.css';

const STORAGE_KEY = 'forecast-data';
const API_URL = "http://gettab1.site:8210";

const STORAGE_TIME = 10 * 60 * 1000;

class Weather {
    constructor() {

        this._init();

    }

    _init() {

        Promise.resolve()
            .then(() => this._getPosition())
            .then(position => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                return this._getForecast();
            })
            .then(forecast => {
                console.log(forecast);
            });


    }

    _getPosition() {
        return new Promise(resolve => {
            var geoSuccess = function(position) {
                console.log(position);
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
        const apiUrl = `${API_URL}?coord=${coordString}`;

        return $.ajax(apiUrl).then(data => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                timestamp: Date.now(),
                forecast: data
            }));
            return data;
        });
    }

    _getConvertedTemp() {

    }


}

const weather = new Weather();