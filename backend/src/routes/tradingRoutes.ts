import { Router } from 'express';
import { openLong, openShort, closePosition, updateTPSL, getPortfolio, getTransactions, addMargin } from '../controllers/tradingController';

const router = Router();

router.post('/buy', openLong);
router.post('/sell', openShort);
router.post('/close', closePosition);
router.post('/tpsl', updateTPSL);
router.post('/margin/add', addMargin);
router.get('/portfolio/:userId', getPortfolio);
router.get('/transactions/:userId', getTransactions);

export default router;
