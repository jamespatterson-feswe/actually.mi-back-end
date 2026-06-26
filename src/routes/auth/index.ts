import { Router } from 'express';
import { PATHS as paths } from './auth.constants';

import login from './login/login.routes';
import register from './register/register.routes';

const router = Router();

router.use(paths.login, login);
router.use(paths.register, register);

export default router;
