

module.exports = {
    createUser: [
        {
            model: 'username',
            required: true,
            path: 'username',
        },
        {
            model: 'email',
            required: true,
            path: 'email',
        },
        {
            model: 'password',
            required: true,
            path: 'password',
        }
    ],
    login: [
        {
            model: 'username',
            required: true,
            path: 'username',
        },
        {
            model: 'password',
            required: true,
            path: 'password',
        }
    ]
}


