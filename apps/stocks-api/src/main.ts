/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from 'hapi';
import * as Redis from 'redis';
import * as Wreck from '@hapi/wreck';
import { environment } from './environments/environment';
import { promisify } from 'util';

const init = async () => {
  const redisClient = Redis.createClient(6379);
  const getAsync = promisify(redisClient.get).bind(redisClient);

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
      const redisSearchKey = `${params.symbol}:${params.period}`;
      const expirationTime = 60 * 60; // 1 hour cache for Redis;

      console.log(redisSearchKey);
      return getAsync(redisSearchKey).then(results => {
        if (results) {
          console.log('results');
          return h.response(JSON.parse(results));
        }

        console.log('no results');
        return Wreck.request(
          'get',
          `${environment.apiURL}/beta/stock/${params.symbol}/chart/${
            params.period
          }?token=${environment.apiKey}`
        ).then(async resp => {
          const data = await Wreck.read(resp);
          redisClient.setex(redisSearchKey, expirationTime, data.toString());
          return h.response(JSON.parse(data.toString()));
        });
      });
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
