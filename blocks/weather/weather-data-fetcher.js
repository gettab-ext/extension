import _ from 'lodash';

const WEATHER_DATA_BASE_URL = 'https://query.yahooapis.com/v1/public/yql?format=json';

class WeatherDataFetcher {

    get({latitude, longitude, city}) {

        const units = 'c';
        const location = city || `(${latitude},${longitude})`;

        const url = (`${WEATHER_DATA_BASE_URL}
            &q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="${location}") and u="${units}"
        `);

        return new Promise((resolve, reject) => {
            $.ajax(url, {
                success: data => {
                    resolve(this._parseData(data));
                },
                error: () => reject()
            });
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
                t: _.get(data, 'item.condition.temp'),
                i: _.get(data, 'item.condition.code'),
                w: _.get(data, 'wind.speed'),
                h: _.get(data, 'atmosphere.humidity'),
                p: null
            },
            forecast: _.map(forecastData, item => {
                return {
                    d: item.text,
                    t: (new Date(item.date)).getTime(),
                    l: item.low,
                    h: item.high,
                    i: item.code
                };
            }),
        };
    }
}

export default WeatherDataFetcher;
