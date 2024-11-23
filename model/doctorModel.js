const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uuid = require('uuid');


const {Schema} = mongoose;

const doctorSchema = new Schema({
        uniqueId: {
            type: String,
            required: true
        },
        fname: {
            type: String,
            trim: true,
            required: [true, 'You must enter your first name'],
            min: [2, 'First name must be more than or equal 2 characters']
        },
        lname: {
            type: String,
            trim: true,
            required: [true, 'You must enter your last name'],
            min: [2, 'Last name must be more than or equal 2 characters']
        },
        email: {
            type: String,
            trim: true,
            // required: [true, 'Email is require'],
            // unique: [true, 'This email is already exists']
        },
        password: {
            type: String,
            trim: true,
            required: [true, 'Password is require!']
        },
        image: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            required: true,
            default: false
        },
        workPlace: {
            type: String,
            trim: true,
        },
        whatsapp: {
            type: String,
            trim: true,
            // required: [true, 'Whatsapp number is require!'],
            // unique: [true, 'This whatsapp number is already exists!']
        },
        facebookId: String,
        specialty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DoctorSpecialty',
            required: [true, 'You must enter the specialty']
        },
        language: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Language',
            required: [true, 'Language is require'],
            default: '67041f35519c14c9e1bba292'
        },
        jobTitle: {
            type: String,
            trim: true,
        },
        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Select your country']
        },
        description: {
            type: String,
            required: [true, 'Description is require!']
        },
        selected: {
            type: Boolean,
            required: true,
            default: false
        },
        tokens: [{
            type: String,
        }],
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    });

// doctorSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//
//     //Hash the password with cost 12
//     this.password = await bcrypt.hash(this.password, 12);
//     //Delete passwordConfirm field
//     this.passwordConfirm = undefined;
//     next();
// });

doctorSchema.pre('save', function (next) {
    if (!this.isModified || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});


// doctorSchema.methods.correctPassword = async function (
//     candidatePassword,
//     doctorPassword
// ) {
//     return await bcrypt.compare(candidatePassword, doctorPassword);
// };

doctorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};

doctorSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};


const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;