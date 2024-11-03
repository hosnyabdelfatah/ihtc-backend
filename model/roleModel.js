const mongoose = require('mongoose');

const { Schema } = mongoose;

const roleSchema = new Schema({
    title:{
        type: String,
        required:[true, 'The role title is require'],
        unique: [true, 'HTis role title is already exists']
    }
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;