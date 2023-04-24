const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path: './config/config.env'})

//Connect to database
connectDB();

//Routes file
const hotels = require('./routes/hotels')

const app = express();

//Body parser
app.use(express.json());

//Mount routers
app.use('/api/v1/hotels', hotels)

//เอา PORT จากไฟล์ env ถ้าลืมให้ set ที่ 3000
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //CLose server $ exit process
    server.close(() => process.exit(1));
});