const mongoose = require('mongoose');

const { Schema } = mongoose;

const doctorSpecialtySchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Doctor specialty must enter!'],
        unique: [true, 'This specialty is already exists!']
    }
});

const DoctorSpecialty = mongoose.model('DoctorSpecialty', doctorSpecialtySchema);
module.exports = DoctorSpecialty;