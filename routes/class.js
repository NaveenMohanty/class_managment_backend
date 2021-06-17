var router = require("express").Router();
const { isAuthenticated, isSignedIn } = require("../controllers/auth");
const {
  createClass,
  editClass,
  getClassById,
} = require("../controllers/class");
// Extract class id, finds it and add to req obj
router.param("classId", getClassById);

router.post("/class/create", isSignedIn, isAuthenticated, createClass);
router.put("/class/edit/:classId", isSignedIn, isAuthenticated, editClass);

module.exports = router;
