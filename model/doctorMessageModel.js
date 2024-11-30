const mongoose = require('mongoose');

const {Schema} = mongoose;

const doctorMessageSchema = new Schema({
        uniqueId: String,
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: [true, 'Message sender is require']
        },
        subject: {
            type: String,
            required: [true, 'Message subject is required']
        },
        messageText: {
            type: String,
            required: [true, 'Campaign text is require'],
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: [true, 'You have to enter the receiver for this message']
        },
        attach: {
            type: String // url to the file address
        },
        status: {
            type: String,
            enum: ["pending", "server", "device", "read"],
            required: true,
            default: 'pending'
        }
    }, {
        timestamps: true,
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    }
);

const DoctorMessage = mongoose.model('DoctorMessage', doctorMessageSchema);

module.exports = DoctorMessage;