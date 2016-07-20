import _ from 'lodash';

import './weather-popup.css';
import './weather-widget.css';

import storage from '../utils/storage';
import Fetcher from '../utils/fetcher';
import utils from '../utils/utils';
import {EVENTS} from '../page/page';

const WEATHER_STORAGE_KEY = 'forecast-data';
const POSITION_STORAGE_KEY = 'position-data';

const WEATHER_API_URL = "http://gettab1.site/w";
const GEOCODE_API_URL = 'http://gettab1.site/g';
const MYSTART_WEATHER_API = 'https://www.mystart.com/api/weather/';

const WEATHER_STORAGE_TIME = 15 * 60 * 1000;
const POSITION_STORAGE_TIME = 15 * 60 * 1000;

const USE_MYSTART_DATA = true;

const monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const forecastDayTmpl = ({day, minTemp, maxTemp}) => `
    <div class="weather-box-forecast">
        <div class="weather-box-forecast__day">
            ${day}
        </div>
        <div class="weather-box-forecast__temp">
            <div class="weather-box-forecast__min-temp">
                ${minTemp}
            </div>
            <div class="weather-box-forecast__max-temp">
                ${maxTemp}
            </div>
        </div>
    </div>
`;

class Weather {
    constructor() {

        this.$widget = $(".weather-widget");
        this.$temp = $(".weather-widget__temp");
        this.$city = $(".weather-widget__city");
        this.$time = $(".weather-widget__time");
        this.$icon = $(".weather-widget__weather-icon");
        this.$status = $(".weather-widget__weather-status");

        this.$forecastContainer = $(".weather-box__forecast");

        this.myStartFetcher = new Fetcher({
            url: MYSTART_WEATHER_API,
            ttl: WEATHER_STORAGE_TIME,
        });

        this._init();
    }

    _init() {

        this._bindEvents();

        if (USE_MYSTART_DATA) {
            this._loadDataMystart();
        } else {
            this._loadDataNative();
        }

        this._startTick();

    }

    _bindEvents() {
        this.$widget.on('click', () => this._showPopup());
        $(".weather-box__close").on('click', () => this._hidePopup());
        $(window).on(EVENTS.hideModals, () => this._hidePopup());
    }

    _startTick() {
        const tick = () => {
            const date = this._getDate();

            if (this._date !== date) {
                this._date = date;
                this.$time.html(date);
            }

            setTimeout(tick, 1000);
        };

        tick();
    }

    _loadDataMystart() {
        Promise.resolve()
            .then(() => this._getMystartData())
            .then(data => {
                this.latitude = data.location.latitude;
                this.longitude = data.location.longitude;

                this._renderWidget(
                    this._getConvertedTemp(data.now.feelsLike),
                    data.location.city,
                    data.forecast[0].shortDescription,
                    data.now.iconCode
                );

                const forecast = data.forecast.map(item => {
                    return {
                        day: dayNames[(new Date(item.timeLocalStr)).getDay()],
                        minTemp: this._getConvertedTemp(item.temperatureLow, true),
                        maxTemp: this._getConvertedTemp(item.temperatureHigh, true)
                    };
                });

                this._renderPopup({
                    feelsLike: this._getConvertedTemp(data.now.feelsLike, true),
                    humidity: data.now.humidity,
                    wind: data.now.windSpeed,
                    rain: data.now.precipProbability,
                    forecast
                });
            });

    }

    _loadDataNative() {
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

                this._renderWidget(
                    this._getConvertedTemp(forecast.currently.apparentTemperature),
                    cityName,
                    forecast.currently.summary
                );
            });
    }

    _renderWidget(currentTemp, cityName, weatherSummary, iconCode) {
        this.$temp.html(currentTemp);
        this.$status.html(weatherSummary);
        this.$city.html(cityName);
        this.$time.html(this._getDate());
        this._setWidgetWeatherIcon(iconCode);

        this._setInited();
    }

    _renderPopup({feelsLike, humidity, wind, rain, forecast}) {
        $(".weather-box__current-feel .weather-box__current-value").html(feelsLike);
        $(".weather-box__current-humidity .weather-box__current-value").html(`${humidity}%`);
        $(".weather-box__current-wind .weather-box__current-value").html(wind);
        $(".weather-box__current-rain .weather-box__current-value").html(rain);

        this._renderForecast(forecast);
    }

    _setWidgetWeatherIcon(iconCode) {
        this.$icon.css({
            'background-image': `url('../images/weather/${iconCode}.png`
        });
    }

    _renderForecast(forecast) {
        this.$forecastContainer.html(forecast.map(forecastDayTmpl).join(''));
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
                            storage.set(POSITION_STORAGE_KEY, coords, POSITION_STORAGE_TIME)
                                .then(() => resolve(coords));
                        };
                        navigator.geolocation.getCurrentPosition(geoSuccess);
                    });
                }
            });
    }

    _getForecast() {
        return storage.get(WEATHER_STORAGE_KEY)
            .then(cachedData => {
                if (cachedData) {
                    console.log('return cached weather data');
                    return cachedData;
                }

                const coordString = [this.latitude, this.longitude].join(',');
                const apiUrl = `${WEATHER_API_URL}?coord=${coordString}`;

                return $.ajax(apiUrl)
                    .then(data => storage.set(WEATHER_STORAGE_KEY, data, WEATHER_STORAGE_TIME));
            });

    }

    _getMystartData() {
        return this.myStartFetcher.get();
    }

    _getConvertedTemp(temp, short) {
        return `${Math.round(parseFloat(temp))}°${short ? '' : 'C'}`;
    }

    _getCityName() {
        const coords = [this.longitude, this.latitude].join(',');
        const geocodeUrl = `${GEOCODE_API_URL}?coord=${coords}`;

        return $.ajax(geocodeUrl).then(response => {
            return _.get(response, 'response.GeoObjectCollection.featureMember[0].GeoObject.name');
        });
    }

    _getDate() {
        const d = new Date();

        const monthIndex = d.getMonth();
        const monthName = monthNames[monthIndex];
        const dayIndex = d.getDay();
        const dayName = dayNames[dayIndex];
        const hours = d.getHours();
        const minutes = String(d.getMinutes());

        return `${hours}:${minutes.length === 1 ? '0' + minutes : minutes} ${dayName}, ${monthName} ${d.getDate()}, `
    }

    _showPopup() {
        $(window).trigger(EVENTS.modalShow);
        $(".weather-box-wrapper").addClass('weather-box-wrapper_active');
    }

    _hidePopup() {
        $(".weather-box-wrapper").removeClass('weather-box-wrapper_active');
    }


}

const weather = new Weather();