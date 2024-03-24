import {Router} from 'express';
import {courseRouter} from './course.router.js';
import {userRouter} from './user.router.js';
import {moduleRouter} from './module.router.js';
import {lessonRouter} from './lesson.router.js';
import {botmakerRouter} from './botmaker.router.js';

// eslint-disable-next-line new-cap
const router = Router();

router.use('/botmaker', botmakerRouter);
router.use('/courses', courseRouter);
router.use('/lessons', lessonRouter);
router.use('/modules', moduleRouter);
router.use('/users', userRouter);

export {router};
