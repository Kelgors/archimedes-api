import express, { Request } from 'express';
import apiV1 from './routes';

const app = express();

app.use((req: Request, res, next) => {
  req.context = { user: null };
  next();
});
app.use(express.json());
app.use('/api', apiV1);

export default app;
