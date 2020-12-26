import express from 'express';
import puzzleListRouter from './puzzle_list';
import puzzleRouter from './puzzle';
const router = express.Router();

router.use('/puzzle_list', puzzleListRouter);
router.use('/puzzle', puzzleRouter);

export default router;
