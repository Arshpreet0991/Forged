import { Router } from 'express';
import { loginUser, registerUser, verifyUser } from './auth.controller';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/verify-user').post(verifyUser);

export default router;
