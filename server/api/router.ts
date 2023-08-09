import express from 'express';
import puzzleListRouter from './puzzle_list';
import puzzleRouter from './puzzle';
import gameRouter from './game';
import recordSolveRouter from './record_solve';
import statsRouter from './stats';
import oEmbedRouter from './oembed'
import linkPreviewRouter from './link_preview'
// import statsRouter from './stats';

const router = express.Router();

router.use('/puzzle_list', puzzleListRouter);
router.use('/puzzle', puzzleRouter);
router.use('/game', gameRouter);
router.use('/record_solve', recordSolveRouter);
router.use('/stats', statsRouter);
router.use('/oembed', oEmbedRouter);
router.use('/link_preview', linkPreviewRouter);
// router.use('/stats', statsRouter); // disabled for perf reasons -- getPuzzleSolves took 5301ms for 62 gids overall /api/stats took 5355ms for 62 solves

export default router;
