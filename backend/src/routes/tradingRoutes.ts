import { Router } from 'express';
import { openLong, openShort, closePosition, updateTPSL, getPortfolio, getTransactions, addMargin, placeLimitOrder, cancelLimitOrder } from '../controllers/tradingController';
import { optionalProtect } from '../middleware/authMiddleware';

const router = Router();

router.use(optionalProtect);

router.post('/buy', openLong);
router.post('/sell', openShort);
router.post('/close', closePosition);
router.post('/tpsl', updateTPSL);
router.post('/margin/add', addMargin);
router.post('/limit', placeLimitOrder);
router.post('/limit/cancel', cancelLimitOrder);
router.get('/portfolio/:userId', getPortfolio);
router.get('/portfolio', getPortfolio);
router.get('/transactions/:userId', getTransactions);
router.get('/transactions', getTransactions);

export default router;
