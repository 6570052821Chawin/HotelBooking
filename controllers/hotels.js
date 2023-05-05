const User = require('../models/User');
const Hotel = require("../models/Hotel");
const Reservation = require("../models/Reservation")
const ObjectId = require('mongoose').Types.ObjectId; 

//@desc     Get all hotels
//@route    /api/v1/hotels
//@access   public
exports.getHotels = async(req, res, next) => {
        let query;

        //Copy req.query
        // ... คือ operator แตกเป็น array จาก string ธรรมดา
        const reqQuery = {...req.query};

        //Fields to exclude
        //จัดการการเครื่องหมาย น้อยกว่า มากกว่าก่อน จึงตัด select กับ sort ออกก่อน
        const removeFields = ['select', 'sort', 'page', 'limit'];

        //Loop over remove fields and delete them from reqQuery
        //Loop ใส่ในตัวแปร param และทำการลบ key & value ตัวนั้น
        removeFields.forEach(param => delete reqQuery[param]);
        console.log(reqQuery);

        //Create query string
        let queryStr = JSON.stringify(reqQuery);
        //เขียน pattern ให้ match กับข้อความ Regex
        //ให้ใส่เครื่องหมาย $ หน้าสื่งที่เราเจอ
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        query = Hotel.find(JSON.parse(queryStr))
                    .populate('reservations')
                    .populate({path: 'user', select: 'name email'})

        //Select Fields
        if(req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }
        //Sort
        if(req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createAt');
        }

        //Pagination user ต้องการข้อมูล page ไหน แต่ถ้าไม่กำหนดให้ page = 1
        const page = parseInt(req.query.page, 10) || 1;
        //limit = แต่ละ page ให้มีข้อมูลกี่ตัว ถ้าไม่กำหนดให้ set เป็น 25
        const limit = parseInt(req.query.limit, 10) || 25;
        //คำนวณหาตำแหน่งแรกของ page เอาตัวสุดท้ายของ page ก่อนหน้ามา
        const startIndex = (page - 1) * limit;
        //หน้าปัจจุบัน * limit
        const endIndex = page * limit;

    try {
        //นับทั้งหมกว่ามีกี่ตัว
        const total = await Hotel.countDocuments();
        //skip ไปที่หน้าที่เราต้องการ
        query = query.skip(startIndex).limit(limit);

        //!Execute query
        const hotels = await query;
        //Pagination result
        const pagination = {};

        //ถ้า endIndex น้อยกว่า total แสดงว่ายังมีหน้าถัดไป
        if(endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        //ถ้า stardIndex > 0 แสดงว่าหน้านี้ไม่ใช่หน้าแรก ต้องมีหน้าก่อนหน้า
        if(startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({
            success: true,
            count: hotels.length,
            pagination,
            data: hotels
        });
    } catch(err) {
        res.status(400).json({success: false, error: err})
    }
}


//@desc     Get single hotel
//@route    /api/v1/hotels/:id
//@access   public

exports.getHotel = async(req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id)
                        .populate('reservations')
                        .populate({path: 'user', select: 'name email'});
        if(!hotel) {
            return res.status(400).json({success: false, error: err})
        }
        res.status(200).json({success: true, data: hotel})
    } catch(err) {
        res.status(400).json({success: false, error: err})
    }
}

//@desc     Create single hotel
//@route    POST /api/v1/user/userId/hotel
//@access   public
exports.createHotel = async(req, res, next) => {
    try {
        req.body.user = req.params.userId
        const user = await User.findById(req.params.userId);
        console.log(req.params.userId)
        console.log(req.body)

        if(!user) {
            res.status(404).json({success: false, message: `No user with the id of ${req.params.userId}`});
        }
        console.log(req.body)
        const hotel = await Hotel.create(req.body);
        res.status(201).json({success: true, data: hotel});
    } catch(err) {
        console.log(err)
        return res.status(500).json({success: false, message: "Cannot create hotel"})
    }
};


//@desc     Update hotel
//@route    /api/v1/hotels/:id
//@access   public
exports.updateHotel = (req, res, next) => {
    res.status(200).json({success: true, msg: `Update hotel ${req.params.id}`});
};


exports.updateHotel = async(req, res, next) => {
    try {
        // แปลงให้เป็น Type.Object
        var id = req.params.id
        id = new ObjectId(id)
        const hotel = await Hotel.findById(id);

        if(!hotel) {
            res.status(400).json({success: false, error: err});
        }

        //Make sure user it the reservation owner
        if(hotel.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this hotel`})
        }

        hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({success: true, data: hotel});
    } catch(err) {
        res.status(400).json({success: false, error: err});
    }
};


//@desc     Delete hotel
//@route    /api/v1/hotels/:id
//@access   public

exports.deleteHotel = async(req, res, next,) => {
    try { 
        // แปลงให้เป็น Type.Object
        var id = req.params.id
        id = new ObjectId(id)
        const hotel = await Hotel.findById(id);

        if(!hotel) {
            res.status(400).json({success: false, message: 'Cannot find hotel'});
        }

        //Make sure user it the reservation owner
        if(hotel.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this hotel`})
        }
        await Reservation.deleteMany({hotel: id});
        await Hotel.deleteOne({_id: id});
        res.status(200).json({success: true, data: {}})
    } catch (err) {
        res.status(400).json({success: false, error: err})
    }
}