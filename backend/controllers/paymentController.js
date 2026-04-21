const crypto = require('crypto');
const Razorpay = require('razorpay');

// Helper to get Razorpay instance
const getRazorpayInstance = () => {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return null;
};

exports.createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body; // Amount in INR

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const instance = getRazorpayInstance();

    if (instance) {
      // Real Razorpay Call
      const options = {
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      };

      const order = await instance.orders.create(options);
      res.status(200).json({ success: true, data: order, isMock: false, keyId: process.env.RAZORPAY_KEY_ID });
    } else {
      // Mock for presentation without API keys
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        entity: 'order',
        amount: amount * 100,
        amount_paid: 0,
        amount_due: amount * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        status: 'created',
      };
      res.status(200).json({ success: true, data: mockOrder, isMock: true, keyId: 'rzp_test_mockKey123' });
    }
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

    if (isMock) {
      // Always verify mock payments
      return res.status(200).json({ success: true, message: 'Payment verified successfully (Mock)' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Razorpay secret not configured' });
    }

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    next(error);
  }
};
