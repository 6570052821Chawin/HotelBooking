const express = require('express');
const {register, login, getMe, logout} = require('../controllers/auth');

//Include other resource routers
const hotelRouter = require('./hotels')

const router = express.Router();

const {protect} = require('../middleware/auth')

//Re-route into other resource routers
router.use('/:userId/hotels', hotelRouter);

//Path register และส่งต่อไปให้ method register ที่ require มาจาก controllers
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);

//export ให้เรียกใช้ router ของเราได้ด้วย
module.exports = router;