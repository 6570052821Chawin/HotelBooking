const express = require('express');

const {getReservations, getReservation, addReservation, updateReservation, deleteReservation} = require('../controllers/reservations');

//สามารถส่งต่อ parameter ได้
const router = express.Router({mergeParams: true});

//ตรวจสอบ role ด้วย
const {protect, authorize}= require('../middleware/auth');

//เรียก function protect และ ทำงาน method getAppointments ที่เราเรียกมาข้างบน
router.route('/')
    .get(protect, getReservations)
    .post(protect, authorize('admin', 'user'), addReservation);
router.route('/:id')
    .get(protect, getReservation)
    .put(protect, authorize('admin', 'user'), updateReservation)
    .delete(protect, authorize('admin', 'user'), deleteReservation);

module.exports = router;