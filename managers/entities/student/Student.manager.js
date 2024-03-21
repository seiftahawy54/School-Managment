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
