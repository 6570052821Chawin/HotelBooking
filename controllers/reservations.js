const Reservation = require('../models/Reservation');
const Hotel = require('../models/Hotel');

//@desc     Get all reservations
//@route    GET api/v1/reservations
//@access   Private
exports.getReservations = async(req, res, next) => {
    let query;
    //User and hotel owner can see booking reservation
    if(req.user.role !== 'admin') {
        // Populate เพื่อดึงข้อมูลอื่นๆขึ้นมาโชว์ด้วย ดูได้จาก response บน postman
        query = Reservation.find({user: req.user.id}).populate({
            path: 'hotel',
            select: 'name province tel'
        });
    } else { //Admin can see every reservations
        query = Reservation.find().populate({
            path: 'hotel',
            select: 'name province tel'
        });
    }

    try {
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch(err) {
        console.log(err);
        return res.status(500).json({success: false, message: 'Cannot find Reservation'})
    }
};


//@desc     Get Single Reservation
//@route    GET /api/v1/reservations/:id
//@access   Private
exports.getReservation = async(req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'hotel',
            select: 'name description tel'
        });

        if(!reservation) {
            return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({success: false, message: "Cannot find reservation"})
    }
}

//@desc     Add reservation
//@route    POST /api/v1/hotels/:hptelId/reservation
//@access   Private
exports.addReservation = async(req, res, next) => {
    try {
        req.body.hotel = req.params.hotelId;
        const hotel = await Hotel.findById(req.params.hotelId);
        //Check ว่าชื่อ hotel นี้อยู่จริงไหม
        if(!hotel) {
            return res.status(404).json({success: false, message: `No hotel with the id of ${req.params.hotelId}`});
        }
        //Check check in date ต้องเร็วกว่า check out date
        let inDate = new Date(req.body.inDate).getTime();
        let outDate = new Date(req.body.outDate).getTime();
        if(outDate <= inDate) {
            return res.status(400).json({success: false, message: "Checkout date is greater than checkin date"})
        }

        // Reservation book upto 3 nights
        let diffDate = outDate - inDate
        let dayDiff = diffDate / (1000 * 60 * 60 * 24);
        console.log(`Night diff: ${dayDiff}`)
        if(dayDiff > 3) {
            return res.status(400).json({success: false, message: `This reservation is ${dayDiff} nights. The reservation can reserve upto 3 night.`})        
        }

        //add user Id into req.user
        //ใน body ของ postman ให้เอาออก เพราะรับค่ามาจาก req.user.id เรียบร้อย
        req.body.user = req.user.id;
        //Check for existed reservation
        // const existedReservations = await Reservation.find({user: req.user.id});
        // if(existedReservations.length >= 3 && req.user.role !== 'admin') {
        //     return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 reservations`})
        // }

        console.log(req.body)
        //req.body จะมีส่วนต่างๆที่ใส่ไว้ รวมถึง hotel
        const reservation = await Reservation.create(req.body);
        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch(err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Cannot create Reservation"})
    }
}


//@desc     Update reservation
//@route    PUT /api/v1/reservation/:id
//@access   Private
exports.updateReservation = async(req, res, next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if(!reservation) {
            return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`});
        }

        //Make sure user it the reservation owner
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this reservation`})
        }
        //Check check in date ต้องเร็วกว่า check out date
        let inDate = new Date(req.body.inDate).getTime();
        let outDate = new Date(req.body.outDate).getTime();
        if(outDate <= inDate) {
            return res.status(400).json({success: false, message: "Checkout date is greater than checkin date"})
        }
        //เจอ reservation ส่ง id และ req.body, set new เป็น true และ run validator ด้วย
        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate({
            path: 'hotel',
            select: 'name province tel'
        });

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({success: false, message: "Cannot update Reservation"});
    }
}

//@desc     Delete reservation
//@route    DELETE /api/v1/reservations/:id
//@access   Private
exports.deleteReservation = async(req, res, next) => {
    var ObjectId = require('mongoose').Types.ObjectId; 
    try {
        var id = req.params.id
        id = new ObjectId(id)
        const reservation = await Reservation.findById(id);
        if(!reservation) {
            return res.status(404).json({success: false, message: `Cannot find reservation id: ${req.params.id}`});
        }

        //Make sure user it the reservation owner
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this reservation`})
        }
        await Reservation.deleteOne({_id: id});
        res.status(200).json({success: true, data:{}});
    } catch(err) {
        console.log(err);
        return res.status(500).json({success: false, message:"Cannot delete reservation"})
    }
}