import { Router } from 'express';
import { getKlines, getQuotes } from '../controllers/stockController';

const router = Router();

router.get('/klines', getKlines);
router.get('/quotes', getQuotes);

export default router;
