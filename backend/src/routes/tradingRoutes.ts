import { Router } from 'express';
import { openLong, openShort, closePosition, updateTPSL, getPortfolio, getTransactions, addMargin, placeLimitOrder, cancelLimitOrder } from '../controllers/tradingController';

const router = Router();

router.post('/buy', openLong);
router.post('/sell', openShort);
router.post('/close', closePosition);
router.post('/tpsl', updateTPSL);
router.post('/margin/add', addMargin);
router.post('/limit', placeLimitOrder);
router.post('/limit/cancel', cancelLimitOrder);
router.get('/portfolio/:userId', getPortfolio);
router.get('/transactions/:userId', getTransactions);

export default router;
