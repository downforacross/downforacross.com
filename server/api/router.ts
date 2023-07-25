import express from 'express';
import puzzleListRouter from './puzzle_list';
import puzzleRouter from './puzzle';
import gameRouter from './game';
import recordSolveRouter from './record_solve';
import statsRouter from './stats';
import oEmbedRouter from './oembed'

const router = express.Router();

router.use('/puzzle_list', puzzleListRouter);
router.use('/puzzle', puzzleRouter);
router.use('/game', gameRouter);
router.use('/record_solve', recordSolveRouter);
router.use('/stats', statsRouter);
router.use('/oembed', oEmbedRouter);

export default router;
