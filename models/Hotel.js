const mongoose = require('mongoose');
const Reservation = require('./Reservation');

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode: {
        type: String,
        required: [true, 'Please add a name'],
        maxlength: [5, 'Postal code can not be more than 5 characters']
    },
    tel: {
        type: String
    },
    region: {
        type: String,
        required: [true, 'Please add aregion']
    }
}, {
    // Code ให่เพื่อให้โชว์ข้อมูล reservations ใน Hotel ด้วย
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Reverse populate with virtuals ของ Hotel schema ต้องการ populate reservation ใน ref reservation
// Code ให่เพื่อให้โชว์ข้อมูล reservations ใน Hotel ด้วย
HotelSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'hotel',
    justOne: false
});

//Cascade delete reservations when a hotel deleted
//ก่อนที่จะลบ hotel ให้มาไล่ลบ reservation ก่อน
// HotelSchema.pre('remove', async function(next){
//     var ObjectId = require('mongoose').Types.ObjectId; 
//     var id = this._id
//     id = new ObjectId(id)
//     console.log(`Reservation being removed from hotel ${id}`);
//     //เรียกใช้ model reservation ที่เกี่ยวข้องกับ hotel อันนี้
//     await this.model('Reservation').deleteMany({hotel: id});
//     //next เพื่อเรียก code ส่วนต่อไป
//     next();
// });

module.exports = mongoose.model('Hotel', HotelSchema);
