const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss=require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

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

//Sanitize data ป้องกันคน Injection login เช่นใส่ email ตัวอักษร greater than แล้วมา login
app.use(mongoSanitize());

//Set security headers เพิ่ม header
app.use(helmet());

//Prevent XSS attacks ป้องกันคน input script เข้ามา
app.use(xss());

//Rate Limiting
const limiter = rateLimit({
    windowsMs: 10 * 60 * 1000, //10 mins
    max: 100000
    });
app.use(limiter);

//Prevent http param pollutions ป้องกันการส่งเช่นส่ง firstname มา 2 อันใน req
app.use(hpp());

//Enable CORS เพื่อให้สามารถ domain อื่นๆ เข้าใช้งาน app ของเราได้
app.use(cors());

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

//Swagger ใช้ Gen API
const swaggerOptions = {
    swaggerDefinition:{
        openapi: '3.0.0',
        info: {
            title: 'Hotel Reservation API',
            version: '1.0.0',
            description: 'A simple Express Hotel Reservation API'
        }
    },
    apis:['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));