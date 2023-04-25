const User = require('../models/User')

//@desc     Register
//@path     POST /api/v1/auth/register
//@access   PUBLIC

exports.register = async(req, res, next) => {
    try {
        const {name, email, password, role} = req.body;

        //Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        // Create token
        //const token = user.getSignedJwtToken();
        //res.status(200).json({success: true, token});
        sendTokenResponse(user, 200, res);
    } catch(err) {
        res.status(400).json({success: false});
        console.log(err.stack);
    }
};


//@desc     Login user
//@route    /api/v1/login
//access    Public
exports.login = async(req, res, next) => {
    const {email, password} = req.body;

    //Validate email & password เช็คว่าเป็นค่าว่างไหม
    if(!email || !password) {
        return res.status(400).json({success: false, msg: 'Please provide an email and password'});
    }

    //Check for user หา email และ select password ที่ตรงกันมาด้วย
    const user = await User.findOne({email}).select('+password');

    if(!user) {
        return res.status(400).json({success: false, msg: 'Invalid credentials'});
    }

    //Check if password matches True || false
    const isMatch = await user.matchPassword(password);

    if(!isMatch) {
        return res.status(401).json({success: false, msg: 'Invalid credentials'});
    }

    //Create token
    //const token = user.getSignedJwtToken();
    //ส่ง Token กลับไปทาง response
    //res.status(200).json({success: true, token});
    //!Comment บรรทัดข้างบนไว้แล้วเรียกใช้ Method sendTokenResponse แทน
    sendTokenResponse(user, 200, res);
}


//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true 
    };

    if(process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    })
}