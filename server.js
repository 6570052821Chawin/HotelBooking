const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path: './config/config.env'})

//Connect to database
connectDB();

//Routes file
const hotels = require('./routes/hotels')
const reservations = require('./routes/reservations')
const auth = require('./routes/auth')
const user = require('./routes/user');


const app = express();

// *** ใส่ Body parser ด้วยจ้า ไม่งั้น Connect database ไม่ได้ ในคลิปไม่มีบอกแต่ใน slide มีจ้า Chapter7.2 ep3
//Body parser
//แปลง string จากข้อมูลที่ได้เป็น json
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Mount routers
app.use('/api/v1/hotels', hotels);
app.use('/api/v1/reservations', reservations);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', user);


//เอา PORT จากไฟล์ env ถ้าลืมให้ set ที่ 3000
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //CLose server $ exit process
    server.close(() => process.exit(1));
});