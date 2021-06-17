const User = require("../model/user");
const Class = require("../model/class");
const Joi = require("joi");

exports.getClassById = async (req, res, next, id) => {
  try {
    if (id) {
      let classData = await Class.findById(id);
      req.classData = classData;
      next();
    } else {
      throw { message: "class_id is undefined", status: 400 };
    }
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

exports.createClass = async (req, res) => {
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
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

exports.editClass = async (req, res) => {
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
          if (v === "teacher_id" && classData.teacher_id !== value[v]) {
            let teacher = await User.findById(classData.teacher_id);
            teacher.class_ids = teacher.class_ids.filter(
              (v) => String(v) !== String(classData._id)
            );
            await teacher.save();
            teacher = await User.findById(value[v]);
            if (teacher.role !== "teacher") {
              reject({
                message: "teacher_id role is not teacher",
                status: 400,
              });
            }
            teacher.class_ids.push(classData._id);
            await teacher.save();
          }
          classData[v] = value[v];
          resolve();
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
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};
