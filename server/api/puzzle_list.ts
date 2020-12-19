import express from 'express';
import {listPuzzles} from '../model/puzzle';

const router = express.Router();
router.get('/', async (req, res) => {
  console.log('got req', req.query);
  const page = Number.parseInt(req.query.page as string);
  const pageSize = Number.parseInt(req.query.pageSize as string);
  if (!(Number.isFinite(page) && Number.isFinite(pageSize))) {
    return res.status(400).send('page and pageSize should be integers');
  }
  const result = await listPuzzles({}, pageSize, page * pageSize);
  res.json({
    puzzles: result,
  });
});

export default router;
