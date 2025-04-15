const express = require('express');
const otpGenerator = require('otp-generator'); // A library to generate OTPs
const twilio = require('twilio'); // Twilio SDK
const OTP = require('../models/otp'); // Mongoose OTP model
const router = express.Router();
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

// Initialize Twilio client
const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Route to generate OTP
router.post('/generate-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Generate OTP
  const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false });
  const otpExpiration = new Date();
  otpExpiration.setMinutes(otpExpiration.getMinutes() + 10); // OTP valid for 10 minutes

  // Save OTP to database
  const existingOtp = await OTP.findOne({ phoneNumber });
  if (existingOtp) {
    existingOtp.otp = otp;
    existingOtp.otpExpiration = otpExpiration;
    await existingOtp.save();
  } else {
    const newOtp = new OTP({ phoneNumber, otp, otpExpiration });
    await newOtp.save();
  }

  // Send OTP via SMS using Twilio
  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' });
  }

  const existingOtp = await OTP.findOne({ phoneNumber });

  if (!existingOtp) {
    return res.status(400).json({ message: 'OTP not found for this phone number' });
  }

  // Check if OTP is expired
  if (new Date() > existingOtp.otpExpiration) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  // Check if OTP matches
  if (existingOtp.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  res.status(200).json({ message: 'OTP verified successfully' });
});

module.exports = router;
