import {Router} from 'express';
import courseRouter from './course.router';
import userRouter from './user.router';
import moduleRouter from './module.router';

const router = Router();

router.use('/courses', courseRouter);
router.use('/modules', moduleRouter);
router.use('/users', userRouter);

export default router;
