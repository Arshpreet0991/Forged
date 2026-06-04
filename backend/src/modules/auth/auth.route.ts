import { Router } from 'express';
import {
  loginUser,
  registerUser,
  verifyUser,
  forgotPassword,
  resetPassword,
  logout,
  refreshAccessToken,
} from './auth.controller';

import checkLogin from '../../shared/middlewares/auth.middleware';

const router = Router();

// public routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/verify-user').post(verifyUser);
router.route('/reset-password-request').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

// protected routes
router.route('/logout').post(checkLogin, logout);
router.route('refresh-token').post(refreshAccessToken);

export default router;
