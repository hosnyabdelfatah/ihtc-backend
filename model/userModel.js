const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
    name:{
        type:String,
        required:[true, 'You must enter the name']
      },
      email:{
        type:String,
        required:[true,''],
        unique: [true, 'This email is already exists']
      },
      image:{
        type: String,
        default:"../public/assets/images/avatar.jpeg",
        required: true
      },
      isActivated:{
        type: Boolean,
        required: true,
        default: false
      },  
      description: String,
      workPlace: String,
      whatsappNumber: {
        type:String,
        required: [true, 'Whatsapp numer is require!'],
        unique: [true, 'This whatsapp number is already exists!']
      },
      facebookId: String,
      specialty:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DoctorSpecialty',
        required:[true, 'You must enter the specialty']
      },
      language:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        default: 'English'
      },
      jobTitle: String,
      country:{
        type:String,
        required: [true, '']
      }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },

});


const User = mongoose.model('User', userSchema);
module.exports = User;