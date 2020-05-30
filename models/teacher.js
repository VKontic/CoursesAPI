const mongoose = require('mongoose');

teacherSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 3,
        maxlength: 20,
        index: true,
        unique: true,
        required: true
        //INDEX
    },
    password: {
        //secured with SHA256
        //must contain at least one digit, one uppercase and one lowercase letter
        type: String,
        minlength: 5,
        maxlength: 64 //length of sha256 hash is 64 
    },
    email: {
        required: true,
        type: String,
        minlength:5,
        maxlength:35,
    },
    role: {
        required: true,
        type: Boolean //0 for teacher, 1 for admin
    },
    course: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Course' }]
})

module.exports = mongoose.model('Teacher', teacherSchema);