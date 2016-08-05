import transport from '../transport/transport.backend';
import Fetcher from '../utils/fetcher';

import GeoDataFetcher from './geo-data-fetcher';
import WeatherDataFetcher from './weather-data-fetcher';

import {API, USE_MYSTART_WEATHER_DATA, USE_CLIENT_WEATHER_FETCH, WEATHER_DATA_TTL} from '../config/config';
import {WEATHER_STORAGE_KEY} from '../config/const';

const MYSTART_WEATHER_API = 'https://www.mystart.com/api/weather/';

class WeatherBackend {
    constructor() {

        this.myStartFetcher = new Fetcher({
            url: MYSTART_WEATHER_API,
            ttl: WEATHER_DATA_TTL,
            key: WEATHER_STORAGE_KEY,
        });
        this.apiDataFetcher = new Fetcher({
            url: `${API}/weather`,
            ttl: WEATHER_DATA_TTL,
            key: WEATHER_STORAGE_KEY,
        });
        this.clientDataFetcher = new Fetcher({
            getter: () => this._fetchClientData(),
            key: WEATHER_STORAGE_KEY,
            autoRefresh: true,
            ttl: WEATHER_DATA_TTL
        });

        this.geoDataFetcher = new GeoDataFetcher();
        this.weatherDataFetcher = new WeatherDataFetcher();

        transport.exposeDataSource(WEATHER_STORAGE_KEY, () => this.get());
    }

    get() {
        if (USE_CLIENT_WEATHER_FETCH) {
            return this.clientDataFetcher.get();
        } else if (USE_MYSTART_WEATHER_DATA) {
            return this.myStartFetcher.get();
        } else  {
            return this.apiDataFetcher.get();
        }
    }

    _fetchClientData() {
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
}

const weatherBackend = new WeatherBackend();
export default weatherBackend;
