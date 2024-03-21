module.exports = {
    createStudent: [
        {
            model: 'longText',
            required: true,
            path: "studentName",
        },
        {
            model: 'id',
            required: true,
            path: "studentClass",
            label: "Class"
        },
        {
            model: 'id',
            required: true,
            path: "studentSchool",
            label: "School"
        },
    ],
}

