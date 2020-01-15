/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from 'hapi';
import { StockPriceService } from './app/services/stock-price.service';
import * as Redis from 'redis';

const init = async () => {
  const redisClient = Redis.createClient(6379);

  const server = new Server({
    port: 3333,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['http://localhost:4200']
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/api/stock-price',
    handler: (request, h) => {
      const params = request.query;
      const symbol = params.symbol as string;
      const period = params.period as string;
      return StockPriceService.getPriceHistory(
        redisClient,
        symbol,
        period
      ).then(results => h.response(results));
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
