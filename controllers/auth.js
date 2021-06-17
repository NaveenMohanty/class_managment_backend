const User = require("../model/user");
const Joi = require("joi");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

exports.Register = async (req, res, next) => {
  try {
    const { body } = req;
    const { error, value } = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      role: Joi.string().required(),
      password: Joi.string().required().min(9),
    }).validate(body);
    if (error) {
      throw error;
    } else {
      if (
        value.role === "instructor" ||
        value.role === "teacher" ||
        value.role === "student"
      ) {
        let user = await User.create(value);
        res.json({
          success: true,
          message: `${user.name} is Registered`,
        });
      } else {
        throw { status: 400, message: "Select valid Role" };
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { body } = req;
    const { error, value } = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(9),
    }).validate(body);

    if (error) {
      throw error;
    } else {
      let user = await User.findOne({ email: value.email });
      if (!user.autheticate(value.password)) {
        throw { status: 401, message: "Password do not match" };
      }

      //create token
      const token = jwt.sign({ _id: user._id }, process.env.SECRET);

      //put token in cookie
      res.cookie("token", token, { expire: new Date() + 9999 });

      //send response
      const { _id, name, email, role } = user;
      return res.json({
        data: { token, user: { _id, name, email, role } },
        message: "Login Successfully",
        success: true,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "User logout successfully",
  });
};

//protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

//custom middlewares to authenticate user and add it to the req
exports.isAuthenticated = async (req, res, next) => {
  try {
    let { auth } = req;
    const { error, value } = Joi.object({
      _id: Joi.string().required(),
      iat: Joi.number().optional(),
    }).validate(auth);
    if (!error) {
      let user = await User.findById(value._id);
      if (user) {
        req.user = user;
      } else {
        throw { message: "User not found", status: 404 };
      }
    } else {
      throw error;
    }
    next();
  } catch (err) {
    next(err);
  }
};
