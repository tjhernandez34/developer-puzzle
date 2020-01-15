/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from 'hapi';
import * as Wreck from '@hapi/wreck';
import { environment } from './environments/environment';

const init = async () => {
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
      return Wreck.request(
        'get',
        `${environment.apiURL}/beta/stock/${params.symbol}/chart/${
          params.period
        }?token=${environment.apiKey}`
      );
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
