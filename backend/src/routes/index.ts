import {Router} from 'express';
import courseRouter from './course.router';
import userRouter from './user.router';

const router = Router();

router.use('/courses', courseRouter);
router.use('/users', userRouter);

export default router;
