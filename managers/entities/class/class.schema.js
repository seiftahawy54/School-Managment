module.exports = {
    createClass: [
        {
            model: 'longText',
            required: true,
            path: "className",
        },
        {
            model: 'arrayOfStrings',
            path: "students",
            required: false,
        },
        {
            model: 'id',
            path: "school",
            required: true,
        }
    ],
    assignStudentsToClass: [
        {
            model: 'arrayOfStrings',
            path: "students",
            required: true,
        },
    ]
}

