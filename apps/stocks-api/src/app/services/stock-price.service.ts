import * as Wreck from '@hapi/wreck';
import { environment } from '../../environments/environment';
import { promisify } from 'util';
import { StockAPIContstants } from '../../stocks-api.constants';
import { RedisClient } from 'redis';
import { IncomingMessage } from 'http';

class StockPriceService {
  static getPriceHistory(
    redisClient: RedisClient,
    symbol: string,
    period: string
  ): Promise<object[]> {
    const redisSearchKey = `${symbol}:${period}`;

    const getAsync: Function = promisify(redisClient.get).bind(redisClient);

    return getAsync(redisSearchKey).then((results: string) => {
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
      )
        .then((resp: IncomingMessage) => {
          return Wreck.read(resp);
        })
        .then(data => {
          const isUnknownSymbol =
            data.toString() === StockAPIContstants.unknownSymbolMessage;

          if (isUnknownSymbol) {
            throw new Error(StockAPIContstants.unknownSymbolMessage);
          }

          redisClient.setex(
            redisSearchKey,
            environment.redisExpirationTime,
            data.toString()
          );
          return JSON.parse(data.toString());
        })
        .catch((err: Error) => {
          throw new Error(err.message);
        });
    });
  }
}

export { StockPriceService };
