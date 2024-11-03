const mongoose = require('mongoose');

const { Schema } = mongoose;

const doctorSpecialtySchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Organization specialty must enter!'],
        unique: [true, 'This organization specialty is already exists!']
    }
});

const DoctorSpecialty = mongoose.model('DoctorSpecialty', doctorSpecialtySchema);
module.exports = DoctorSpecialty;