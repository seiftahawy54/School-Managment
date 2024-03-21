const mongoose = require("mongoose");
module.exports = class Student {

    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.studentsCollection = "student";
        this.httpExposed = ['addStudent', 'get=getAllStudents', 'get=getStudent', 'delete=deleteStudent', 'put=updateStudent'];
    }


    /**
     * @api {POST} /students/addStudent Add a Student
     * @apiName AddStudent
     * @apiGroup Students
     *
     * @apiDescription Creates a new student entry.
     *
     * @apiParam {string} studentName Name of the student to be created.
     * @apiParam {string} studentClass ID of the class to which the student belongs.
     * @apiParam {string} studentSchool ID of the school where the student is enrolled.
     *
     * @apiSuccess {Object} student The newly created student object.
     *
     * @apiError (400 Bad Request) {string} error Potential errors returned by the validator.
     */
    async addStudent({studentName, studentClass, studentSchool}) {
        const student = {studentName, studentClass, studentSchool};

        // Data validation
        let result = await this.validators.student.createStudent({
            ...student
        });
        if (result) return result;

        // Creation Logic
        let createdStudent = {studentName, studentClass, studentSchool}

        createdStudent = await this.mongomodels.student.create(createdStudent);

        // Response
        return {
            student: createdStudent
        };
    }

    /**
     * @api {GET} /students/getAllStudents Get All Students
     * @apiName GetAllStudents
     * @apiGroup Students
     *
     * @apiDescription Retrieves a list of all students, including populated data for associated classes and schools.
     *
     * @apiParam {Object} __shortToken  User authorization token.
     *
     * @apiSuccess {Array} students An array of student objects, with each student's 'studentClass' and 'studentSchool' fields populated.
     *
     * @apiError (500 Internal Server Error) {string} error An error message if the retrieval fails.
     */
    async getAllStudents({
                             __shortToken,
                             __params
                         }) {
        return this.mongomodels.student.find({})
            .populate([
                {
                    path: 'studentClass',
                    model: this.mongomodels.class
                },
                {
                    path: 'studentSchool',
                    model: this.mongomodels.school
                }
            ]);
    }

    /**
     * @api {GET} /students/getStudent/:id Get a Student
     * @apiName GetStudent
     * @apiGroup Students
     *
     * @apiDescription Retrieves the details of a specific student, including populated data for their class and school.
     *
     * @apiParam (URL Parameters) {string} id ID of the student to retrieve.
     * @apiParam {Object} __shortToken  User authorization token.
     *
     * @apiSuccess {Object} student The student object, with its 'studentClass' and 'studentSchool' fields populated.
     *
     * @apiError (400 Bad Request) {string} error 'invalid student id'
     * @apiError (404 Not Found) {string} error 'student not found'
     */
    async getStudent({__shortToken, __params}) {
        const {id: studentId} = __params;
        if (!mongoose.isValidObjectId(studentId)) {
            return {
                error: "invalid student id"
            }
        }

        const student = await this.mongomodels.student.findById(studentId)
            .populate([
                {
                    path: 'studentClass',
                    model: this.mongomodels.class
                },
                {
                    path: 'studentSchool',
                    model: this.mongomodels.school
                }
            ]);

        if (!student) {
            return {
                error: "student not found"
            }
        }

        return {
            student
        }
    }

    /**
     * @api {DELETE} /students/deleteStudent/:id Delete a Student
     * @apiName DeleteStudent
     * @apiGroup Students
     *
     * @apiDescription Deletes a specific student from the system. Requires authorization.
     *
     * @apiParam (URL Parameters) {string} id ID of the student to be deleted.
     * @apiParam {Object} __shortToken  User authorization token.
     *
     * @apiSuccess {Object} message Confirmation message of the deleted student.
     *
     * @apiError (400 Bad Request) {string} error 'invalid student id'
     * @apiError (401 Unauthorized) {string} error 'unauthorized'
     * @apiError (404 Not Found) {string} error 'student not found'
     */
    async deleteStudent({__shortToken, __params}) {
        const {userRole} = __shortToken;

        if (userRole < 3) {
            return {
                error: "unauthorized"
            }
        }

        const {id: studentId} = __params;
        if (!mongoose.isValidObjectId(studentId)) {
            return {
                error: "invalid student id"
            }
        }

        const student = await this.mongomodels.student.findById(studentId);

        if (!student) {
            return {
                error: "student not found"
            }
        }

        await this.mongomodels.student.findByIdAndDelete(studentId);

        return {
            message: "student deleted"
        }
    }

    /**
     * @api {PUT} /students/updateStudent/:id Update a Student
     * @apiName UpdateStudent
     * @apiGroup Students
     *
     * @apiDescription Updates the class and/or school of a specific student. Requires authorization.
     *
     * @apiParam (URL Parameters) {string} id ID of the student to be updated.
     * @apiParam {Object} __shortToken  User authorization token.
     * @apiParam {string} [newClass]  Optional new class ID to assign to the student.
     * @apiParam {string} [newSchool] Optional new school ID to assign to the student.
     *
     * @apiSuccess {Object} message Confirmation message of the updated student.
     *
     * @apiError (400 Bad Request) {string} error 'invalid student id'
     * @apiError (401 Unauthorized) {string} error 'unauthorized'
     * @apiError (404 Not Found) {string} error 'student not found'
     */
    async updateStudent({__shortToken, __params, newClass, newSchool}) {
        const {userRole} = __shortToken;

        if (userRole < 3) {
            return {
                error: "unauthorized"
            }
        }

        const {id: studentId} = __params;
        if (!mongoose.isValidObjectId(studentId)) {
            return {
                error: "invalid student id"
            }
        }

        const student = await this.mongomodels.student.findById(studentId);

        if (!student) {
            return {
                error: "student not found"
            }
        }

        await this.mongomodels.student.findByIdAndUpdate(studentId, {
            $set: {
                studentClass: newClass,
                studentSchool: newSchool
            }
        });

        return {
            message: "student updated"
        }
    }
}
