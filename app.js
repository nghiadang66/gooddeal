const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

//import routes
const testRoutes = require('./routes/testRoute');
const authRoutes = require('./routes/authRoute');

//app
const app = express();

//db
mongoose.connect(process.env.DATABASE, (error) => {
    if (error) throw error;
    console.log('DB connected!');
});

//middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

//routes middlewares
app.use('/api', testRoutes);
app.use('/api', authRoutes);

//port
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
