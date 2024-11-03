const mongoose = require('mongoose');

const {Schema} = mongoose;

const userTypeSchema = new Schema({
        title: {
            type: String,
            required: [true, 'The user type title is require'],
            unique: [true, 'This user type title is already exists']
        }
    },
    {
        timestamps: true,
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });

const UserType = mongoose.model('UserType', userTypeSchema);
module.exports = UserType;