const mongoose = require('mongoose');

const {Schema} = mongoose;

const audienceTargetSchema = new Schema({
    campaignUniqueId: {
        type: String,
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
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

const AudienceTarget = mongoose.model('AudienceTarget', audienceTargetSchema);

module.exports = AudienceTarget;