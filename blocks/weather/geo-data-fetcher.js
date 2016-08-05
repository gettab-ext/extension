import {API} from '../config/config';

const GEO_DATA_URL = `${API}/geo`;

class GeoDataFetcher {
    get() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: GEO_DATA_URL,
                success: data => resolve(data)
            });
        });
    }
}

export default GeoDataFetcher;
