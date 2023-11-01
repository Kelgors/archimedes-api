import express from 'express';
import { AuthSignSchema } from '../schemas/Auth';
import { authService } from '../services/AuthService';

const router = express.Router();

router.post('/sign', async function (req, res, next) {
  const result = await AuthSignSchema.safeParseAsync(req.body);
  if (!result.success) {
    return next(result.error);
  }
  const body = result.data;
  try {
    const token = await authService.signIn(body.email, body.password);
    return res.status(201).json({ token }).end();
  } catch (err) {
    return next(err);
  }
});

export default router;
