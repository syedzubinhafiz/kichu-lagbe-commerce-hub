import express, { RequestHandler } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser as RequestHandler);
router.post('/login', loginUser as RequestHandler);
router.post('/logout', logoutUser as RequestHandler); // logoutUser is sync, but cast for consistency
router.post('/refresh', refreshToken as RequestHandler);

export default router; 