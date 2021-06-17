const User = require("../model/user");
const Class = require("../model/class");
const Joi = require("joi");
const classHelper = require("../helper/class");

exports.getClassById = async (req, res, next, id) => {
  try {
    if (id) {
      let classData = await Class.findById(id);
      if (classData) req.classData = classData;
      else throw { message: "Class not found", status: 404 };
      next();
    } else {
      throw { message: "class_id is undefined", status: 400 };
    }
  } catch (err) {
    next(err);
  }
};

exports.createClass = async (req, res, next) => {
  try {
    const { body, user } = req;
    const { error, value } = Joi.object({
      topic: Joi.string().required(),
      start_time: Joi.date().greater("now").required(),
      end_time: Joi.date().greater(Joi.ref("start_time")).required(),
      teacher_id: Joi.string().optional(),
    }).validate(body);
    if (!error) {
      if (user.role !== "instructor") {
        throw { message: "User must be Instructor", status: 405 };
      } else {
        value.instructor_id = user._id;
        let teacherData;
        if (value.teacher_id) {
          teacherData = await User.findById(value.teacher_id);
          if (teacherData.role === "teacher")
            value.teacher_id = teacherData._id;
          else throw { message: "This is not teacher id", status: 400 };
        }
        let classData = await Class.create(value);
        user.class_ids.push(classData._id);
        if (teacherData) {
          teacherData.class_ids.push(classData._id);
        }
        await teacherData.save();
        await user.save();
        return res.json({
          success: true,
          message: "Class created successfully",
          data: classData,
        });
      }
    } else {
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

exports.editClass = async (req, res, next) => {
  try {
    const { body, classData, user } = req;
    const { error, value } = Joi.object({
      topic: Joi.string().optional(),
      start_time: Joi.date().greater("now").optional(),
      end_time: Joi.date().greater(Joi.ref("start_time")).optional(),
      teacher_id: Joi.string().optional(),
    }).validate(body);
    if (!error) {
      let keys = Object.keys(value);
      let promises = keys.map((v) => {
        return new Promise(async (resolve, reject) => {
          try {
            if (v === "teacher_id" && classData.teacher_id !== value[v]) {
              let teacher = await User.findById(classData.teacher_id);
              teacher.class_ids = teacher.class_ids.filter(
                (v) => String(v) !== String(classData._id)
              );
              await teacher.save();
              teacher = await User.findById(value[v]);
              if (teacher.role !== "teacher") {
                throw {
                  message: "teacher_id role is not teacher",
                  status: 400,
                };
              }
              teacher.class_ids.push(classData._id);
              await teacher.save();
            }
            classData[v] = value[v];
            resolve();
          } catch (er) {
            reject(er);
          }
        });
      });

      await Promise.all(promises);
      let data = await classData.save();
      res.json({
        success: true,
        message: "Class data saved successfully",
        data,
      });
    } else {
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteClass = async (req, res, next) => {
  try {
    const { classData, user } = req;
    if (String(user._id) === String(classData.instructor_id)) {
      await classHelper.removeClassFromUser(
        classData.instructor_id,
        classData._id
      );
      await classHelper.removeClassFromUser(
        classData.teacher_id,
        classData._id
      );
      let promises = classData.student_ids.map((id) => {
        return new Promise(async (resolve, reject) => {
          try {
            await classHelper.removeClassFromUser(id, classData._id);
            resolve(true);
          } catch (er) {
            reject(er);
          }
        });
      });
      await Promise.all(promises);
      await Class.deleteOne({ _id: classData._id });
      res.json({
        success: true,
        message: "Class deleted successfully",
      });
    } else {
      throw { message: "User not authorized to delete", status: 400 };
    }
  } catch (err) {
    next(err);
  }
};

exports.addStudentsToClass = async (req, res, next) => {
  try {
    const { classData, user, body } = req;
    const { error, value } = Joi.object({
      student_ids: Joi.array().items(Joi.string().required()),
    }).validate(body);
    const roleChecker = user.role === "teacher" || user.role === "instructor";
    const accessChecker =
      String(classData.instructor_id) === String(user._id) ||
      String(classData.teacher_id) === String(user._id);
    if (roleChecker && accessChecker && !error) {
      let currentStudentsIds = classData.student_ids;
      let newStudentsIds = value.student_ids;
      let add = newStudentsIds.filter(
        (x) => !currentStudentsIds.includes(String(x))
      );
      let dele = currentStudentsIds.filter(
        (x) => !newStudentsIds.includes(String(x))
      );
      await classHelper.addClassToStudents(add, classData._id);
      await classHelper.deleClassFromStudents(dele, classData._id);
      classData.student_ids = value.student_ids;
      await classData.save();
      res.json({ success: true, message: "Students list Updated" });
    } else {
      if (error) throw error;
      else
        throw { message: "User not authorized to add Students", status: 400 };
    }
  } catch (err) {
    next(err);
  }
};

exports.getClassList = async (req, res, next) => {
  try {
    const { user } = req;
    let data = await classHelper.createClassList(user.class_ids);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
