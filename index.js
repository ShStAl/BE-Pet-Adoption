const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes.js');
const petRoutes = require('./routes/petRoutes.js');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');

const URL = process.env.URL;
const PORT = process.env.PORT;
const FE_URL = process.env.FE_URL;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: FE_URL, credentials: true }));

app.use('/', userRoutes);
app.use('/', petRoutes);

mongoose
  .connect(URL)
  .then(() => {
    console.log('DB connected');
    app.listen(PORT, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log('DB connection error', err));


module.exports = app;
