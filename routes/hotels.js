const express = require('express');
const {getHotels, getHotel, createHotel, updateHotel, deleteHotel} = require('../controllers/hotels');

const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

//!ใน authorize ให้ใส่ role ที่ต้องการทำ ดูได้ใน Model User
router.route('/').get(getHotels).post(protect, authorize('admin'), createHotel);
router.route('/:id').get(getHotel).put(protect, authorize('admin'), updateHotel).delete(protect, authorize('admin'), deleteHotel);

module.exports = router;