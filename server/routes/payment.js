import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/payment/bkash/create
// @desc    Create bKash payment
// @access  Private
router.post('/bkash/create', protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Get bKash token
    const authResponse = await axios.post(
      `${process.env.BKASH_BASE_URL}/tokenized/checkout/token/grant`,
      {
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/json',
          username: process.env.BKASH_USERNAME,
          password: process.env.BKASH_PASSWORD
        }
      }
    );

    const { id_token } = authResponse.data;

    // Create payment
    const paymentResponse = await axios.post(
      `${process.env.BKASH_BASE_URL}/tokenized/checkout/create`,
      {
        mode: '0011',
        payerReference: req.user._id.toString(),
        callbackURL: `${process.env.CLIENT_URL}/payment/callback`,
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: orderId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: id_token,
          'x-app-key': process.env.BKASH_APP_KEY
        }
      }
    );

    res.json({
      success: true,
      data: paymentResponse.data
    });
  } catch (error) {
    console.error('bKash payment error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create bKash payment',
      error: error.response?.data || error.message
    });
  }
});

// @route   POST /api/payment/bkash/execute
// @desc    Execute bKash payment
// @access  Private
router.post('/bkash/execute', protect, async (req, res) => {
  try {
    const { paymentID } = req.body;

    // Get token (same as create)
    const authResponse = await axios.post(
      `${process.env.BKASH_BASE_URL}/tokenized/checkout/token/grant`,
      {
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/json',
          username: process.env.BKASH_USERNAME,
          password: process.env.BKASH_PASSWORD
        }
      }
    );

    const { id_token } = authResponse.data;

    // Execute payment
    const executeResponse = await axios.post(
      `${process.env.BKASH_BASE_URL}/tokenized/checkout/execute`,
      { paymentID },
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: id_token,
          'x-app-key': process.env.BKASH_APP_KEY
        }
      }
    );

    res.json({
      success: true,
      data: executeResponse.data
    });
  } catch (error) {
    console.error('bKash execute error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to execute bKash payment',
      error: error.response?.data || error.message
    });
  }
});

// @route   POST /api/payment/nagad/create
// @desc    Create Nagad payment
// @access  Private
router.post('/nagad/create', protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const timestamp = Date.now();
    const merchantId = process.env.NAGAD_MERCHANT_ID;

    // Create sensitive data
    const sensitiveData = {
      merchantId,
      datetime: timestamp,
      orderId,
      challenge: crypto.randomBytes(20).toString('hex')
    };

    // Sign sensitive data
    const signature = crypto
      .createSign('SHA256')
      .update(JSON.stringify(sensitiveData))
      .sign(process.env.NAGAD_PRIVATE_KEY, 'base64');

    // Create payment request
    const paymentResponse = await axios.post(
      `${process.env.NAGAD_BASE_URL}/remote-payment-gateway-1.0/api/dfs/check-out/initialize/${merchantId}/${orderId}`,
      {
        accountNumber: process.env.NAGAD_MERCHANT_NUMBER,
        dateTime: timestamp,
        sensitiveData: Buffer.from(JSON.stringify(sensitiveData)).toString('base64'),
        signature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': req.ip,
          'X-KM-Client-Type': 'PC_WEB'
        }
      }
    );

    res.json({
      success: true,
      data: paymentResponse.data
    });
  } catch (error) {
    console.error('Nagad payment error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create Nagad payment',
      error: error.response?.data || error.message
    });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify payment status
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { paymentId, method } = req.body;

    // Implement verification logic based on payment method
    // This is a placeholder - actual implementation depends on gateway

    res.json({
      success: true,
      verified: true,
      transactionId: paymentId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payment/webhook/bkash
// @desc    bKash webhook for payment notifications
// @access  Public (but should verify signature)
router.post('/webhook/bkash', async (req, res) => {
  try {
    // Process bKash webhook
    console.log('bKash webhook received:', req.body);
    
    // Update order payment status based on webhook data
    // Implementation depends on your Order model structure

    res.json({ success: true });
  } catch (error) {
    console.error('bKash webhook error:', error);
    res.status(500).json({ success: false });
  }
});

export default router;
