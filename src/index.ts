import 'reflect-metadata';
import { HOST, PORT } from './config';
import { createServer } from './server';

createServer().then(function (app) {
  app.listen(
    {
      port: PORT,
      host: HOST,
    },
    function () {
      console.log(`Listening on ${HOST}:${PORT}`);
    },
  );
});
