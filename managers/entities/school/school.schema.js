module.exports = {
    createSchool: [
        {
            model: 'longText',
            required: true,
            path: "schoolName",
        },
        {
            model: 'arrayOfStrings',
            path: "classes",
            required: false,
        }
    ],
    assignClassesToSchool: [
        {
            model: 'id',
            path: "schoolId",
            required: true,
        },
        {
            model: 'arrayOfStrings',
            path: "classes",
            required: true,
        }
    ],
}

