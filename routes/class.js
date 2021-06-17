var router = require("express").Router();
const { isAuthenticated, isSignedIn } = require("../controllers/auth");
const {
  createClass,
  editClass,
  getClassById,
  deleteClass,
  addStudentsToClass,
  getClassList,
} = require("../controllers/class");

// Extract class id, finds it and add to req obj
router.param("classId", getClassById);

// Instructor can create class by giving details
router.post("/class", isSignedIn, isAuthenticated, createClass);

// Instructor can edit class by giving details
router.put("/class/:classId", isSignedIn, isAuthenticated, editClass);

// Instructor can delete class
router.delete("/class/:classId", isSignedIn, isAuthenticated, deleteClass);

// Instructor and the assigned teacher can add students to class by giving students ids array
router.put(
  "/class/addstudent/:classId",
  isSignedIn,
  isAuthenticated,
  addStudentsToClass
);

/**
 * Instructor gets the list of class it has created
 * Teacher gets the list of class it has been assigned as a teacher
 * Students gets the list of class in which they are enrolled
 */
router.get("/class/list", isSignedIn, isAuthenticated, getClassList);

module.exports = router;
