const mongoose = require('mongoose');

const {Schema} = mongoose;

// If we  add more languages we will make this schema  if not we will make it enum.
// Which what the language make a relation???

const languageSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Language title must enter!'],
        min: [4, 'Language title must be more than or equal 4 characters'],
        unique: [true, 'This language already exists']
    },
    flag: {
        type: String
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

const Language = mongoose.model('Language', languageSchema);
module.exports = Language;