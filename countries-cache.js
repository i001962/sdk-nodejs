var axios = require('axios');

class CountriesCache {
    constructor(portalHost, slidingWindowMilliseconds, expiresOn, logger) {
        this._host = portalHost || 'portal-backend.incountry.com';
        this._slidingWindowMilliseconds = slidingWindowMilliseconds || 60000
        this._expiresOn = expiresOn || Date.now() + slidingWindowMilliseconds;

        this._getUrl = `https://${this._host}/countries`;

        this._countries = null;  // Lazy load this on demand

        this._logger = logger || require('./logger').withBaseLogLevel("error")
    }

    async getCountriesAsync(timeStamp) {
        if (!this._countries || !timeStamp || timeStamp >= this._expiresOn) {
            this._countries = (await this._hardRefreshAsync())
                .filter(country => !!country.direct);
        }

        return this._countries;
    }

    async _hardRefreshAsync() {
        try {
            this._expiresOn = Date.now() + this._slidingWindowMilliseconds;
            var response = await axios.get(this._getUrl);
            if (response.data) {
                return response.data.countries;
            }
        }
        catch (exc) {
            this._logger.write("error", exc);
            throw(exc);
        }
    }
}

module.exports = CountriesCache;
