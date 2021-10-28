const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

//import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const storeRoutes = require('./routes/store');
const levelRoutes = require('./routes/level');
const commissionRoutes = require('./routes/commission');
const userFollowStoreRoutes = require('./routes/userFollowStore');

//app
const app = express();

//db
mongoose.connect(process.env.DATABASE, (error) => {
    if (error) throw error;
    console.log('DB connected!');
});

//middlewares
app.use(morgan('dev'));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: [
            `http://localhost:${process.env.CLIENT_PORT_1}`,
            `http://localhost:${process.env.CLIENT_PORT_2}`,
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    }),
);

//routes middlewares
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', storeRoutes);
app.use('/api', levelRoutes);
app.use('/api', commissionRoutes);
app.use('/api', userFollowStoreRoutes);

//port
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
