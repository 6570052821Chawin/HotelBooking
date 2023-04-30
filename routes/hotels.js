const express = require('express');
const {getHotels, getHotel, createHotel, updateHotel, deleteHotel} = require('../controllers/hotels');

// Include other resource routers
const reservationRouter = require('./reservations');

const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../middleware/auth');

//Re-route unto other resource routers
router.use('/:hotelId/reservations', reservationRouter);

//!ใน authorize ให้ใส่ role ที่ต้องการทำ ดูได้ใน Model User
router.route('/')
    .get(getHotels)
    .post(protect, authorize('admin', 'hOwner'), createHotel);
router.route('/:id')
    .get(getHotel)
    .put(protect, authorize('admin', 'hOwner'), updateHotel)
    .delete(protect, authorize('admin', 'hOwner'), deleteHotel);

module.exports = router;