import { Router } from 'express';
import { PATHS as paths } from './auth/auth.constants';

import routes from './auth';

const router = Router();

router.use(paths.auth, routes);

export default router;
