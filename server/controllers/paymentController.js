// controllers/paymentController.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export const initializePayment = async (req, res) => {
  const { amount, email, fullName } = req.body;

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // convert to kobo
        metadata: {
          fullName
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error('Paystack init error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to initialize payment' });
  }
};

export const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const paymentData = response.data.data;

    if (paymentData.status === 'success') {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: paymentData
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Paystack verify error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
};
