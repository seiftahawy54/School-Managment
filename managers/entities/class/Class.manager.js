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
