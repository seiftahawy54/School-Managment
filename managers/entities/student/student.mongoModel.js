const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    studentClass: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'class'
    },
    studentSchool: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'school'
    },
})

module.exports = mongoose.model('student', StudentSchema);
