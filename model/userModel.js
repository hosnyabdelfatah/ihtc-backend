const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const {Schema} = mongoose;

const userSchema = new Schema({
        uniqueId: {
            type: String,
            required: true
        },
        fname: {
            type: String,
            required: [true, 'You must enter your first name']
        },
        lname: {
            type: String,
            required: [true, 'You must enter your last name']
        },
        email: {
            type: String,
            required: [true, ''],
            unique: [true, 'This email is already exists']
        },
        password: {
            type: String,
            trim: true,
            // required: [true, 'Password is require!']
        },
        avatar: {
            type: String,
            default: "../public/assets/images/avatar.jpeg",
            required: true
        },
        isActivated: {
            type: Boolean,
            required: true,
            default: false
        },
        description: String,
        workPlace: String,
        whatsapp: {
            type: String,
            required: [true, 'Whatsapp number is require!'],
            unique: [true, 'This whatsapp number is already exists!']
        },
        facebook: String,
        specialty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DoctorSpecialty',
            required: [true, 'You must enter the specialty']
        },
        language: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Language is require'],
        },
        jobTitle: String,
        country: {
            type: String,
            required: [true, 'Country is require']
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

///////////////

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    //Hash the password with cost 12
    this.password = await bcrypt.hash(this.password, 12);
    //Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

// userSchema.

userSchema.pre('save', function (next) {
    if (!this.isModified || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});


userSchema.methods.comparePasswords = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
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

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

/////////////

const User = mongoose.model('User', userSchema);
module.exports = User;