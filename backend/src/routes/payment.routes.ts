import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { createPaymentPreauth, handleBancardWebhook, verifyBancardSignature } from '../services/payment.service';

const router = Router();

const preauthSchema = z.object({
  body: z.object({
    booking_id: z.string().uuid()
  })
});

router.post('/preauth', validate(preauthSchema), async (req, res) => {
  try {
    const { payment_url, transaction_id } = await createPaymentPreauth(req.body.booking_id);
    return res.json({ payment_url, transaction_id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment initiation failed';
    return res.status(400).json({ error: message });
  }
});

const createSchema = z.object({
  body: z.object({
    booking_id: z.string().uuid()
  })
});

router.post('/create', requireAuth, validate(createSchema), async (req, res) => {
  try {
    const { payment_url, transaction_id } = await createPaymentPreauth(req.body.booking_id);
    return res.json({ payment_url, transaction_id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment initiation failed';
    return res.status(400).json({ error: message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-bancard-signature'] as string | undefined;
    const rawBody = req.rawBody;
    if (!rawBody || !verifyBancardSignature(rawBody, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    await handleBancardWebhook(req.body as Record<string, unknown>);
    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid webhook payload';
    return res.status(400).json({ error: message });
  }
});

export default router;
