import './weather-popup.css';
import './weather-widget.css';

import page, {EVENTS} from '../page/page';
import transport from '../transport/transport';

const FORECAST_DAYS = 5;

const ICON_FONT = [
    ":", "p", "S", "Q", "S", "W", "W", "W", "W", "I", "W", "I", "I", "I", "I", "W", "I", "W", "U", "Z", "Z", "Z", "Z", "Z", "E", "E", "3", "a", "A", "a", "A", "6", "1", "6", "1", "W", "1", "S", "S", "S", "M", "W", "I", "W", "a", "S", "U", "S"
];

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

        this._init();
    }

    _init() {
        this._bindEvents();
        transport.requestData('weather-data').then(data => this._processData(data));
        this._startTick();
    }

    _bindEvents() {
        this.$widget.on('click', () => this._showPopup());
        $(".weather-box__close").on('click', () => this._hidePopup());
        page.bindPopupHide('.weather-box__forecast, .weather-widget', () => this._hidePopup());
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

    _processData(data) {
        this.latitude = data.location.latitude;
        this.longitude = data.location.longitude;

        this._renderWidget(
            this._getConvertedTemp(data.now.feelsLike),
            data.location.city,
            data.forecast[0].shortDescription,
            data.now.iconCode
        );

        const forecast = data.forecast.slice(0, FORECAST_DAYS).map(item => {
            return {
                day: dayNames[(new Date(parseInt(item.timeLocalStr))).getDay()],
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
        const $rain = $(".weather-box__current-rain");

        $(".weather-box__current-feel .weather-box__current-value").html(feelsLike);
        $(".weather-box__current-humidity .weather-box__current-value").html(`${humidity}%`);
        $(".weather-box__current-wind .weather-box__current-value").html(wind);
        $rain.find(".weather-box__current-value").html(rain);

        if (!rain) {
            $rain.remove();
        }

        this._renderForecast(forecast);
    }

    _setWidgetWeatherIcon(iconCode) {
        this.$icon.css({
            'background-image': `url('../images/weather/${iconCode}.png`
        });
        this.$icon.text(this._convertCodeToIconFont(iconCode));
    }

    _renderForecast(forecast) {
        this.$forecastContainer.html(forecast.map(forecastDayTmpl).join(''));
    }

    _setInited() {
        this.$widget.addClass('weather-widget_inited');
    }

    _getData() {

    }

    _getConvertedTemp(temp, short) {
        return `${Math.round(parseFloat(temp))}°${short ? '' : 'C'}`;
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

    _convertCodeToIconFont(code) {
        return ICON_FONT[code];
    }


}

const weather = new Weather();
