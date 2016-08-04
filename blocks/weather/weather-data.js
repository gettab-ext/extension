import _ from 'lodash';
import Fetcher from '../utils/fetcher';
import {WEATHER_DATA_TTL} from '../config/config';

const WEATHER_DATA_BASE_URL = 'https://query.yahooapis.com/v1/public/yql?format=json';

class WeatherDataFetcher {
    constructor() {

    }

    get({latitude, longitude, city}) {

        const units = 'c';
        const location = city || `(${latitude},${longitude})`;

        const url = (`${WEATHER_DATA_BASE_URL}
            &q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="${location}") and u="${units}"
        `);

        const fetcher = new Fetcher({
            url: url,
            ttl: WEATHER_DATA_TTL,
            noHttpCache: true
        });

        return fetcher.get()
            .then(data => {
                const parsedData = this._parseData(data);
                if (!parsedData) {
                    throw new Error();
                }
                return parsedData;
            })
            .catch(err => {
                console.log('Error getting weather');
            });
    }

    _parseData(data) {
        data = _.get(data, 'query.results.channel');
        const forecastData = _.get(data, 'item.forecast') || [];

        if (!data || _.get(data, 'query.results.channel.description') === 'Yahoo! Weather Error') {
            return null;
        }

        return {
            now: {
                feelsLike: _.get(data, 'item.condition.temp'),
                iconCode: _.get(data, 'item.condition.code'),
                windSpeed: _.get(data, 'wind.speed'),
                humidity: _.get(data, 'atmosphere.humidity'),
                precipProbability: null
            },
            forecast: _.map(forecastData, item => {
                return {
                    shortDescription: item.text,
                    timeLocalStr: (new Date(item.date)).getTime(),
                    temperatureLow: item.low,
                    temperatureHigh: item.high,
                    iconCode: item.code
                };
            }),
        };
    }
}

export default WeatherDataFetcher;
