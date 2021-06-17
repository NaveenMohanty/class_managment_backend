var router = require("express").Router();
const { isAuthenticated, isSignedIn } = require("../controllers/auth");
const {
  createClass,
  editClass,
  getClassById,
  deleteClass,
  addStudentsToClass,
} = require("../controllers/class");
// Extract class id, finds it and add to req obj
router.param("classId", getClassById);

router.post("/class", isSignedIn, isAuthenticated, createClass);
router.put("/class/:classId", isSignedIn, isAuthenticated, editClass);
router.delete("/class/:classId", isSignedIn, isAuthenticated, deleteClass);
router.put(
  "/class/addstudent/:classId",
  isSignedIn,
  isAuthenticated,
  addStudentsToClass
);

module.exports = router;
