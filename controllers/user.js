const User = require('../models/User');
const Hotel = require('../models/Hotel');
const ObjectId = require('mongoose').Types.ObjectId; 

//@desc     Get all users
//@route    /api/v1/user
//@access   Private
exports.getUsers = async(req, res, next) => {
    let query;
    //Copy req.query
    // ... คือ operator แตกเป็น array
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

    query = User.find(JSON.parse(queryStr)).populate('hotels').populate('reservations');

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
        const total = await User.countDocuments();
        //skip ไปที่หน้าที่เราต้องการ
        query = query.skip(startIndex).limit(limit);

        //!Execute query
        const users = await query;
        //Pagination result
        const pagination = {};

        if(endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }
        
        res.status(200).json({
            success: true,
            count: users.length,
            pagination,
            data: users
        })
    } catch(err) {
        res.status(400).json({success: false, error: err})
    }
}


//@desc     Get single user
//@route    /api/v1/users/:id
//@access   Private
exports.getUser = async(req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('hotels').populate('reservations');
        if(!user) {
            return res.status(400).json({success: false});
        }

        res.status(200).json({success: true, data: user});
    } catch(err) {
        res.staus(400).json({success: false, error: err})
    };
};


//@desc     Delete user
//@route    /api/v1/users/:id
//@access   Private
exports.deleteUser = async(req, res, next) => {
    try {
        let id = req.params.id
        id = new ObjectId(id)
        let user = await User.findById(id)
        if(!user) {
            return res.status(400).json({success: false});
        }
        let hotel = await Hotel.deleteMany({user: id});
        await User.deleteOne({_id: id});
        console.log(hotel)
        res.status(200).json({success: true, data: {}});
    } catch(err) {
        res.status(400).json({success: false, error: err});
    }
}