const User = require("../model/user");

const classHelper = {
  removeClassFromUser: async (user_id, class_id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await User.findById(user_id);
        if (!user) throw { message: "User not found", status: 404 };
        user.class_ids = user.class_ids.filter(
          (v) => String(v) !== String(class_id)
        );
        await user.save();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = classHelper;
