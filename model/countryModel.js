const mongoose = require('mongoose');

const {Schema} = mongoose;

// If we  add more languages we will make this schema  if not we will make it enum.
// Which what the language make a relation???

const countrySchema = new Schema({
    title: {
        type: String,
        required: [true, 'Country title must enter!'],
        min: [4, 'Country title must be more than or equal 4 characters'],
        unique: [true, 'This country already exists']
    },
    flag: {
        type: String
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

const Country = mongoose.model('Country', countrySchema);
module.exports = Country;