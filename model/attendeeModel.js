const mongoose = require('mongoose');
const validator = require('validator');

const { Schema} = mongoose;

const attendeeSchema = new Schema({
    badgeId:{
        type: String,
        required: [true, 'Unique ID must enter!'],
        unique: true
    },
    isActivated: {
        type: Boolean,
        required: true,
        default: false
    },
    fname:{
        type:String,
        required: [true,'Must enter the name!'],
        min: [3, 'First name must be more than or equal 3 characters'],
    },
    lname:{
        type:String,
        required: [true,'Must enter the name!'],
        min: [3, 'Last name must be more than or equal 3 characters'],
    },
    image: {
        type: String,
        default:"",
        required: [true, '']
    },
    description: String,
    email:{
        type: String,
        required: [true, 'Email must enter!'],
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email!"]
    },
    organization: String,
    whatsappNumber: {
        type: String,
        required: [true, 'Whatsapp number is require!']
    },
    facebookId: String,
    specialty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DoctorSpecialty',
        required: true,
        default: 'Others'
    },
    mainRole: {
        enum: ['exhibitor', 'sponsor', 'participant', 'visitor'],
        required: [true, 'Please select the visitor role']
    },
    subRole: {
        enum: ['p', 'p+', 'p++']
    },
    language:  {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Language'
    },
    position: String, // Job title   
    qrCode : String,
    isPaid:{
        type: Boolean,
        default: false
    },
},{
    timestamp: true,
    toObject: { virtuals: true},
    toJson:{virtuals: true}
});

const Attendee = mongoose.model('Attendee', attendeeSchema);
module.exports = Attendee;