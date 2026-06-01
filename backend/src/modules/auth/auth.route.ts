import { Router } from 'express';
import {
  loginUser,
  registerUser,
  verifyUser,
  forgotPassword,
  resetPassword,
} from './auth.controller';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/verify-user').post(verifyUser);
router.route('/reset-password-request').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

export default router;
