import { HOST, PORT } from './config';
import app from './server';

app.listen(PORT, HOST, function () {
  console.log(`Listening on ${HOST}:${PORT}`);
});
