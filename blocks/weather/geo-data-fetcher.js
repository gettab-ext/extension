import {API, GEO_DATA_TTL} from '../config/config';
import Fetcher from '../utils/fetcher';

const GEO_DATA_URL = `${API}/geo`;

class GeoDataFetcher {
    constructor() {
        this.fetcher = new Fetcher({
            url: GEO_DATA_URL,
            ttl: GEO_DATA_TTL,
            noHttpCache: true
        });
    }
    get() {
        return this.fetcher.get();
    }
}

export default GeoDataFetcher;
