const bcrypt = require('bcrypt');

module.exports = class User {

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.userExposed         = ['createUser'];
        this.httpExposed         = ['createUser', 'login'];
    }

    async createUser({name, username, email, password}){
        const user = {name, username, email, password};

        // Data validation
        let result = await this.validators.user.createUser(user);

        if(result) return result;

        user.password = bcrypt.hashSync(user.password, 10);

        let createdUser = await this.mongomodels.user.create(user);

        return {
            user: createdUser, 
        };
    }

    async login({
        username,
        password,
                }) {

        let result = await this.validators.user.login({
            username,
            password
        });
        if(result) return result;

        // Logic
        let user = await this.mongomodels.user.findOne({username});

        if (!user) {
            return {
                error: 'user not found'
            }
        }

        // TODO add encryption key later
        if (!bcrypt.compareSync(password, user.password)) {
            return {
                error: 'wrong password'
            }
        }

        // Logic
        let longToken = this.tokenManager.genShortToken({ userId: user._id.toString(), userRole: user.role });

        // Response
        return {
            longToken
        }
    }

}
