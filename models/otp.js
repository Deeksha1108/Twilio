const mongoose = require('mongoose')
const { set } = require('../routes/userRoute')

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  otpExpiration: {
    type: Date,
    get: otpExpiration => otpExpiration.getTime(),
    set: otpExpiration => new Date(otpExpiration)
  }
});

module.exports = mongoose.model('otp', otpSchema);