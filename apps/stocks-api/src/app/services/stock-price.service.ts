import * as Redis from 'redis';
import * as Wreck from '@hapi/wreck';
import { environment } from '../../environments/environment';
import { promisify } from 'util';

class StockPriceService {
  static getPriceHistory(redisClient: any, symbol: string, period: string) {
    const redisSearchKey = `${symbol}:${period}`;
    const getAsync = promisify(redisClient.get).bind(redisClient);

    return getAsync(redisSearchKey).then(results => {
      if (results) {
        console.log('results');
        return JSON.parse(results);
      }

      console.log('no results');
      return Wreck.request(
        'get',
        `${environment.apiURL}/beta/stock/${symbol}/chart/${period}?token=${
          environment.apiKey
        }`
      ).then(async resp => {
        const data = await Wreck.read(resp);
        redisClient.setex(
          redisSearchKey,
          environment.redisExpirationTime,
          data.toString()
        );
        return JSON.parse(data.toString());
      });
    });
  }
}

export { StockPriceService };
