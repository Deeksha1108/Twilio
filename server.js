require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute'); 

const app = express();
const port = process.env.SERVER_PORT || 3000; 
mongoose.connect('mongodb://127.0.0.1:27017/otpdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

app.use(express.json()); 

app.use('/api', userRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});