const express = require('express');
const {getHotels, getHotel, createHotel, updateHotel, deleteHotel} = require('../controllers/hotels');

const router = express.Router();

const {protect} = require('../middleware/auth');

router.route('/').get(getHotels).post(protect, createHotel);
router.route('/:id').get(getHotel).put(protect, updateHotel).delete(protect, deleteHotel);

module.exports = router;