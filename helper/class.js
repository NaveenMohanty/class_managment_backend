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
  addClassToStudents: async (student_ids, class_id) => {
    let promises = student_ids.map((id) => {
      return new Promise(async (resolve, reject) => {
        try {
          let user = await User.findById(id);
          if (user && user.role === "student") {
            user.class_ids.push(class_id);
            await user.save();
          } else {
            throw {
              message: `User with id:${id} cannot be added`,
              status: 400,
            };
          }
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    });
    return await Promise.all(promises);
  },
  deleClassFromStudents: async (student_ids, class_id) => {
    let promises = student_ids.map((id) => {
      return new Promise(async (resolve, reject) => {
        try {
          let user = await User.findById(id);
          if (user) {
            user.class_ids = user.class_ids.filter(
              (v) => String(v) !== String(class_id)
            );
            await user.save();
          } else {
            throw {
              message: `User with id:${id} cannot be removed`,
              status: 400,
            };
          }
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    });
    return await Promise.all(promises);
  },
};

module.exports = classHelper;
