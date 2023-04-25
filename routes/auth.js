const express = require('express');
const {register, login, getMe} = require('../controllers/auth');
const router = express.Router();

const {protect} = require('../middleware/auth')

//Path register และส่งต่อไปให้ method register ที่ require มาจาก controllers
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

//export ให้เรียกใช้ router ของเราได้ด้วย
module.exports = router;