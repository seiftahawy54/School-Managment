const mongoose = require("mongoose");
module.exports = class School {

    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.utils = utils;
        this.tokenManager = managers.token;
        this.schoolsCollection = "school";
        this.httpExposed = ['addSchool', 'get=getAllSchools', 'put=assignClassesToSchool', 'get=getSchool', 'delete=deleteSchool'];
    }

    async addSchool({
                        __shortToken,
                        schoolName,
                        classes,
                    }) {

        const { userRole } = __shortToken;

        if (userRole < 3) {
            return {
                error: 'unauthorized'
            }
        }

        const school = {
            schoolName,
            classes
        };

        let result = await this.validators.school.createSchool({
            ...school
        });
        if (result) return result;

        // Creation Logic
        let createdSchool = await this.mongomodels.school.create(school);

        // Response
        return {
            school: createdSchool
        };
    }

    async getAllSchools({
                            __shortToken
                        }) {

        return await this.mongomodels.school.find({})
            .populate([
                {
                    path: 'classes',
                    model: this.mongomodels.class
                }
            ])
    }

    async assignClassesToSchool({__shortToken, __params, classes}) {
        const { userRole } = __shortToken;
        const { id: schoolId } = __params;

        if (userRole < 3) {
            return {
                error: 'unauthorized'
            }
        }
        let school = await this.mongomodels.school.findById(schoolId);

        if (!school) {
            return {
                error: 'school not found'
            }
        }

        let result = await this.validators.school.assignClassesToSchool({
            schoolId,
            classes
        });
        if (result) return result;

        await this.mongomodels.school.updateOne({
            _id: new mongoose.Types.ObjectId(schoolId)
        }, {
            $addToSet: {
                classes
            }
        })

        await school.save();

        return {
            school
        }
    }

    async getSchool({schoolId}) {

        if (!(mongoose.isValidObjectId(schoolId))) {
            return {
                error: 'invalid school id'
            }
        }

        const school = await this.mongomodels.school.find({
            _id: new mongoose.Types.ObjectId(schoolId), // schoolId
        })
            .populate([
                {
                    path: 'classes',
                    model: this.mongomodels.class
                }
            ])

        if (!school) {
            return {
                error: 'school not found'
            }
        }

        return {
            school
        }
    }

    async deleteSchool({schoolId}) {
        if (!(mongoose.isValidObjectId(schoolId))) {
            return {
                error: 'invalid school id'
            }
        }

        const school = await this.mongomodels.school.findById(schoolId);

        if (!school) {
            return {
                error: 'school not found'
            }
        }

        return await this.mongomodels.school.deleteOne({
            _id: new mongoose.Types.ObjectId(schoolId)
        })
    }

}
