const mongoose = require('mongoose');

const {Schema} = mongoose;

const messageAudienceTargetSchema = new Schema({
    messageUniqueId: {
        type: String,
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "server", "device", "read"],
        required: true,
        default: 'pending'
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

const MessageAudienceTarget = mongoose.model('MessageAudienceTarget', messageAudienceTargetSchema);

module.exports = MessageAudienceTarget;