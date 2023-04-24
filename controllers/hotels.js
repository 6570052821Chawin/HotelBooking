const Hotel = require("../models/Hotel");

//@desc     Get all hotels
//@route    /api/v1/hotels
//@access   public
exports.getHotels = async(req, res, next) => {
    try {
        const hotels = await Hotel.find()
        res.status(200).json({success: true, count: hotels.length, data: hotels});
    } catch(err) {
        res.status(400).json({success: false, error: err})
    }
}


//@desc     Get single hotel
//@route    /api/v1/hotels/:id
//@access   public

exports.getHotel = async(req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if(!hotel) {
            return res.status(400).json({success: false, error: err})
        }
        res.status(200).json({success: true, data: hotel})
    } catch(err) {
        res.status(400).json({success: false, error: err})
    }
}

//@desc     Create single hotel
//@route    /api/v1/hotels/:id
//@access   public
exports.createHotel = async(req, res, next) => {
    console.log(req.body);
    const hotel = await Hotel.create(req.body);
    res.status(201).json({success: true, data: hotel});
};


//@desc     Update hotel
//@route    /api/v1/hotels/:id
//@access   public
exports.updateHotel = (req, res, next) => {
    res.status(200).json({success: true, msg: `Update hotel ${req.params.id}`});
};


exports.updateHotel = async(req, res, next) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!hotel) {
            res.status(400).json({success: false, error: err});
        }

        res.status(200).json({success: true, data: hotel});
    } catch(err) {
        res.status(400).json({success: false, error: err});
    }
};


//@desc     Delete hotel
//@route    /api/v1/hotels/:id
//@access   public

exports.deleteHotel = async(req, res, next) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);

        if(!hotel) {
            res.status(400).json({success: false, error: err});
        }

        res.status(200).json({success: true, data: {}})
    } catch (err) {
        res.status(400).json({success: false, error: err})
    }
}