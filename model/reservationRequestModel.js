const mongoose = require('mongoose');

const { Schema } = mongoose;

const reservationRequestSchema = new Schema({
    fromId: String, // What is this? is it for badge??
    organizationId: { //toId.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'You must select the organization you want to make an appointment with it!']
    },
    dateCode:Int, // What is it??
    startDay:Int, //Is the date more than one day???
    startHour: {
        type: Date, // Do we select it or the doctor or the organization???
        required: [true, 'You must select which hour you want the appointment'],
    },
    startMinute: Date, //??? the start hour is nice, why we add the minute??
    reservationStatus:{
        enum:['onhold', 'pending', 'confirmed', 'rejected'],
        required: true,
        default: 'onhold' // What is the different between onHold and pending?
    },
},{
    timestamps: true,
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

const ReservationRequest  = mongoose.model('ReservationRequest', reservationRequestSchema);

MediaSourceHandle.exports = ReservationRequest ;