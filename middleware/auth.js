const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Protect routes
exports.protect = async(req, res, next) => {
    let token;

    //ใส่ค่า Bearer เข้ามาไหม ที่ set เข้ามาจาก postman ฝังเข้ามาใน Header
    //Split แค่ token ออกมาแล้วตัด Bearer ที่อยู่ใน array ตัวที่ 0
    //เอาเฉพาะ Token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    //Make sure token exist
    if(!token) {
        return res.status(401).json({success: false, msg: 'Not authorize to access this route'});
    }

    try {
        //Verify token
        //Verift token กับ secret จะได้ตัวแปร decoded ออกมา
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        //เอา id ใน decoded มา find by id
        req.user = await User.findById(decoded.id);

        //next จาก function protect
        next();
    } catch(err) {
        console.log(err.stack);
        return res.status(401).json({success: false, msg:'Not authorize to access this route'})
    }
};