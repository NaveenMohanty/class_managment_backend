const User = require("../model/user");
const Joi = require("joi");

exports.getUserList = async (req, res, next) => {
  try {
    const { role } = req.query;
    const { user } = req;
    const { error, value } = Joi.object({
      role: Joi.string().required(),
    }).validate({ role });
    let checker =
      role === "instructor" &&
      (user.role === "student" || user.role === "teacher");
    if (!error && user.role !== "student" && !checker) {
      let data = await User.find({ role: role });
      res.json({ success: true, data });
    } else {
      if (user.role === "student")
        throw {
          message: "You are not allowed to access this data",
          status: 400,
        };
      else throw error;
    }
  } catch (err) {
    next(err);
  }
};
