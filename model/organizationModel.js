const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const {Schema} = mongoose;

const organizationSchema = new Schema({
        uniqueId: {
            type: String,
            required: [true, 'Unique Id is require!'],
            unique: [true, 'This unique Id is already exists!']
        },
        name: {
            type: String,
            trim: true,
            required: [true, 'Organization name must enter']
        },
        email: {
            type: String,
            trim: true,
            required: [true, 'Organization email must enter'],
            unique: [true, 'This email already exists']
        },
        password: {
            type: String,
            trim: true,
            required: [true, 'Password is require']
        },
        phone: {
            type: String,
            trim: true,
            required: [true, 'Phone number must enter'],
            unique: [true, 'This phone already exists']
        },
        mobile: {
            type: String,
            trim: true,
            required: [true, 'Mobile number must enter'],
            unique: [true, 'This mobile already exists']
        },
        logo: {
            type: String,
            required: [true, 'Image logo is require']
        },
        banner: String,
        description: {
            type: String,
            required: [true, 'Description is require']
        },
        industryField: {
            type: String,
            trim: true,
            required: [true, 'The field of industrial is require']
        },
        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'please enter the country']
        },
        active: {
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
        timestamp: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);


organizationSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    //Hash the password with cost 12
    this.password = await bcrypt.hash(this.password, 12);
    //Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

organizationSchema.pre('save', function (next) {
    if (!this.isModified || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});


organizationSchema.methods.correctPassword = async function (
    candidatePassword,
    organizationPassword
) {
    return await bcrypt.compare(candidatePassword, organizationPassword);
};

organizationSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
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

organizationSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};


const Organization = mongoose.model('Organization', organizationSchema);
module.exports = Organization;