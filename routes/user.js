const express = require('express');
const {getUsers, getUser, deleteUser} = require('../controllers/user');

//Include other resource routers
const hotelRouter = require('./hotels')

const router = express.Router();

const {protect, authorize} = require('../middleware/auth')

//Re-route into other resource routers
router.use('/:userId/hotels', hotelRouter);

router.route('/').get(protect, authorize('admin'), getUsers)
router.route('/:id').get(protect, authorize('admin'), getUser).delete(protect, authorize('admin'), deleteUser)

//export ให้เรียกใช้ router ของเราได้ด้วย
module.exports = router;