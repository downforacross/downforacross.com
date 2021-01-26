import express from 'express';
import puzzleListRouter from './puzzle_list';
import puzzleRouter from './puzzle';
import recordSolveRouter from './record_solve';

const router = express.Router();

router.use('/puzzle_list', puzzleListRouter);
router.use('/puzzle', puzzleRouter);
router.use('/record_solve', recordSolveRouter);

export default router;
