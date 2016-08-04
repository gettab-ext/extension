import transport from '../transport/transport-backend';
import Fetcher from '../utils/fetcher';

import GeoDataFetcher from './geo-data-fetcher';
import WeatherDataFetcher from './weather-data-fetcher';

import {API, USE_MYSTART_WEATHER_DATA, USE_CLIENT_WEATHER_FETCH} from '../config/config';

const MYSTART_WEATHER_API = 'https://www.mystart.com/api/weather/';
const WEATHER_STORAGE_TIME = 20 * 60 * 1000;

class WeatherBackend {
    constructor() {

        transport.exposeDataSource('weather-data', () => this.get());

        this.myStartFetcher = new Fetcher({
            url: MYSTART_WEATHER_API,
            ttl: WEATHER_STORAGE_TIME,
        });
        this.apiDataFetcher = new Fetcher({
            url: `${API}/weather`,
            ttl: WEATHER_STORAGE_TIME
        });
        this.geoDataFetcher = new GeoDataFetcher();
        this.weatherDataFetcher = new WeatherDataFetcher();
    }

    get() {
        if (USE_CLIENT_WEATHER_FETCH) {
            return this._loadClientData();
        } else if (USE_MYSTART_WEATHER_DATA) {
            return this._loadDataMystart();
        } else  {
            return this._loadApiData();
        }
    }

    _loadClientData() {
        return this.geoDataFetcher.get()
            .then(location => {
                return Promise.all([Promise.resolve(location), this.weatherDataFetcher.get(location)]);
            })
            .then(results => {
                const locationData = results[0];
                const weatherData = results[1];
                return Object.assign({}, {location: locationData}, weatherData);
            })
            .catch(err => {
                console.log(err);
            });
    }

    _loadDataMystart() {
        return this.myStartFetcher.get();
    }

    _loadApiData() {
        return this.apiDataFetcher.get();
    }
}

const weatherBackend = new WeatherBackend();
export default weatherBackend;
