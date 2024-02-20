import {Router} from 'express';
import courseRouter from './course.router';

const router = Router();

router.use('/courser', courseRouter);

export default router;
