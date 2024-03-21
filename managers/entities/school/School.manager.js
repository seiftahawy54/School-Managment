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

    /**
     * @api {POST} /schools/addSchool Add a School
     * @apiName AddSchool
     * @apiGroup Schools
     *
     * @apiDescription Creates a new school entry. Requires authorization.
     *
     * @apiParam {Object} __shortToken User authorization token.
     * @apiParam {string} schoolName Name of the school to be created.
     * @apiParam {Array} classes  Optional array of initial class IDs or class objects to be associated with the school.
     *
     * @apiSuccess {Object} school The newly created school object.
     *
     * @apiError (400 Bad Request) {string} error Potential errors returned by the validator.
     * @apiError (401 Unauthorized) {string} error 'unauthorized'
     */

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

    /**
     * @api {GET} /schools/getAllSchools Get All Schools
     * @apiName GetAllSchools
     * @apiGroup Schools
     *
     * @apiDescription Retrieves a list of all schools, including populated data for associated classes.
     *
     * @apiParam {Object} __shortToken  User authorization token.
     *
     * @apiSuccess {Array} schools An array of school objects, with each school's 'classes' field populated.
     *
     * @apiError (500 Internal Server Error) {string} error An error message if the retrieval fails.
     */
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

    /**
     * @api {PUT} /schools/assignClassesToSchool/:id Assign Classes to School
     * @apiName AssignClassesToSchool
     * @apiGroup Schools
     *
     * @apiDescription Assigns classes to an existing school. Requires authorization.
     *
     * @apiParam {Object} __shortToken User authorization token.
     * @apiParam (URL Parameters) {string} id ID of the school to update.
     * @apiParam {Array} classes Array of class IDs to assign to the school.
     *
     * @apiSuccess {Object} school  The updated school object.
     *
     * @apiError (400 Bad Request) {string} error Potential errors returned by the validator.
     * @apiError (401 Unauthorized) {string} error 'unauthorized'
     * @apiError (404 Not Found) {string} error 'school not found'
     */
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

    /**
     * @api {GET} /schools/getSchool/:id Get a School
     * @apiName GetSchool
     * @apiGroup Schools
     *
     * @apiDescription Retrieves details of a specific school, including populated data for associated classes.
     *
     * @apiParam (URL Parameters) {string} id ID of the school to retrieve.
     * @apiParam {Object} __shortToken  User authorization token.
     *
     * @apiSuccess {Object} school The school object with its 'classes' field populated.
     *
     * @apiError (400 Bad Request) {string} error 'invalid school id'
     * @apiError (401 Unauthorized) {string} error 'unauthorized'
     * @apiError (404 Not Found) {string} error 'school not found'
     */
    async getSchool({__shortToken, __params}) {
        const {id: schoolId} = __params

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

    /**
     * @api {DELETE} /schools/deleteSchool/:id Delete a School
     * @apiName DeleteSchool
     * @apiGroup Schools
     *
     * @apiDescription Deletes a specific school from the system. Requires authorization.
     *
     * @apiParam (URL Parameters) {string} id ID of the school to be deleted.
     * @apiParam {Object} __shortToken  User authorization token.
     *
     * @apiSuccess {Object} school Confirmation of the deleted school.
     *
     * @apiError (400 Bad Request) {string} error 'invalid school id'
     * @apiError (401 Unauthorized) {string} error 'unauthorized'
     * @apiError (404 Not Found) {string} error 'school not found'
     */
    async deleteSchool({__params, __shortToken}) {
        const { userRole } = __shortToken
        if (userRole < 3) {
            return {
                error: 'unauthorized'
            }
        }
        const {id: schoolId} = __params

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
