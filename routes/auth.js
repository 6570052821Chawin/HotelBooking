const express = require('express');
const {register, login} = require('../controllers/auth');
const router = express.Router();

//Path register และส่งจ่อไปให้ method register ที่ require มาจาก controllers
router.post('/register', register);
router.post('/login', login);

//export ให้เรียกใช้ router ของเราได้ด้วย
module.exports = router;