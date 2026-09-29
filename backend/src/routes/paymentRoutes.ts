import { Router, Request, Response } from 'express';
import { protect, optionalProtect } from '../middleware/authMiddleware';

const router = Router();
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// 1. Create Checkout Link (Requires Auth)
router.post('/create-checkout', protect, async (req: any, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.token;
    const authHeader = token ? `Bearer ${token}` : req.headers.authorization;

    const resp = await fetch(`${PYTHON_URL}/api/v1/payment/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {}),
        ...(authHeader ? { Authorization: authHeader } : {})
      },
      body: JSON.stringify(req.body)
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (error: any) {
    console.error('Error forwarding create-checkout to python:', error);
    return res.status(500).json({ success: false, message: 'Lỗi kết nối cổng thanh toán' });
  }
});

// 2. PayOS Webhook (Public with PayOS Signature verification)
router.post('/payos-webhook', async (req: Request, res: Response) => {
  try {
    const resp = await fetch(`${PYTHON_URL}/api/v1/payment/payos-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (error: any) {
    console.error('Error forwarding payos-webhook to python:', error);
    return res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
});

// 3. Verify Order with PayOS directly (Requires Auth)
router.get('/verify-order/:orderCode', protect, async (req: any, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.token;
    const authHeader = token ? `Bearer ${token}` : req.headers.authorization;

    const resp = await fetch(`${PYTHON_URL}/api/v1/payment/verify-order/${req.params.orderCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {}),
        ...(authHeader ? { Authorization: authHeader } : {})
      }
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (error: any) {
    console.error('Error forwarding verify-order to python:', error);
    return res.status(500).json({ success: false, message: 'Lỗi xác minh thanh toán' });
  }
});

export default router;
