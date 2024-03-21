const mongoose = require("mongoose");
module.exports = class Classes {

    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.studentsCollection = "class";
        this.httpExposed = ['addClass', 'get=getAllClasses', 'put=assignStudentsToClass', 'delete=deleteClass'];
    }

    /**
     * @api {POST} /classes/addClass Add a Class
     * @apiName AddClass
     * @apiGroup Classes
     *
     * @apiDescription Adds a new class to the system.
     *
     * @apiParam {Object} params - Parameters for class creation.
     * @apiParam {Object} params.__shortToken - User authorization token.
     * @apiParam {string} body.className - Name of the class to be created.
     * @apiParam {Array} body.students  - Array of student IDs or objects to be associated with the class.
     * @apiParam {string} body.school - ID or identifier of the school where the class belongs.
     *
     * @apiSuccess {Object} class The newly created class object.
     *
     * @apiError (401 Unauthorized) {string} error 'unauthorized'
     */
    async addClass({__shortToken, className, students, school}) {

        const {userRole} = __shortToken;
        if (userRole < 3) {
            return {
                error: 'unauthorized'
            }
        }

        const newClass = {className, students, school};

        let result = await this.validators.class.createClass({
            ...newClass
        });

        if (result) return result;

        let createdClass = {
            ...newClass,
        }

        createdClass = await this.mongomodels.class.create({
            ...createdClass
        });

        return {
            class: createdClass
        };
    }

    /**
     * @api {GET} /classes/getAllClasses Get All Classes
     * @apiName GetAllClasses
     * @apiGroup Classes
     *
     * @apiDescription Retrieves a list of all classes, populating associated student and school data.
     *
     * @apiParam {Object} __shortToken - User authorization token.
     *
     * @apiSuccess {Array} classes An array of class objects, including populated student and school information.
     *
     * @apiError (500 Internal Server Error) {string} error An error message if the retrieval fails.
     */
    async getAllClasses({
                            __shortToken
                        }) {
        return await this.mongomodels.class.find({})
            .populate([
                {
                    path: 'students',
                    model: this.mongomodels.student
                },
                {
                    path: 'school',
                    model: this.mongomodels.school
                }
            ]);
    }

    /**
     * @api {PUT} /classes/assignStudentsToClass/:id Assign Students to Class
     * @apiName AssignStudentsToClass
     * @apiGroup Classes
     *
     * @apiDescription Assigns students to an existing class. Requires authorization.
     *
     * @apiParam {Object} __shortToken User authorization token.
     * @apiParam {Array} students Array of student IDs to assign to the class.
     * @apiParam (URL Parameters) {string} id ID of the class to update.
     *
     * @apiSuccess {Object} class The updated class object.
     *
     * @apiError (400 Bad Request) {string} error 'invalid class id'
     * @apiError (401 Unauthorized) {string} error 'unauthorized'
     * @apiError (404 Not Found) {string} error 'class not found'
     */
    async assignStudentsToClass({__shortToken, students, __params}) {

        const {userRole} = __shortToken;
        if (userRole < 3) {
            return {
                error: 'unauthorized'
            }
        }

        const {id: classId} = __params;
        if (!mongoose.isValidObjectId(classId)) {
            return {
                error: 'invalid class id'
            }
        }

        const class_ = await this.mongomodels.class.findById(classId);

        if (!class_) {
            return {
                error: 'class not found'
            }
        }


        let result = await this.validators.class.assignStudentsToClass({
            students
        });

        if (result) return result;

        const updatedClass = await this.mongomodels.class.updateOne({
            _id: new mongoose.Types.ObjectId(classId)
        }, {
            $addToSet: {
                students
            }
        })


        return {
            class: updatedClass
        };
    }

    /**
     * @api {DELETE} /classes/deleteClass/:id Delete a Class
     * @apiName DeleteClass
     * @apiGroup Classes
     *
     * @apiDescription Deletes a class from the system. Requires authorization.
     *
     * @apiParam {Object} __shortToken User authorization token.
     * @apiParam (URL Parameters) {string} id ID of the class to be deleted.
     *
     * @apiSuccess {Object} class Confirmation of the deleted class.
     *
     * @apiError (400 Bad Request) {string} error 'invalid class id'
     * @apiError (401 Unauthorized) {string} error 'unauthorized'
     * @apiError (404 Not Found) {string} error 'class not found'
     */
    async deleteClass({__shortToken, __params}) {

        const {userRole} = __shortToken;
        if (userRole < 3) {
            return {
                error: 'unauthorized'
            }
        }

        const {id: classId} = __params;
        if (!mongoose.isValidObjectId(classId)) {
            return {
                error: 'invalid class id'
            }
        }

        return await this.mongomodels.class.deleteOne({
            _id: new mongoose.Types.ObjectId(classId)
        })
    }

}
