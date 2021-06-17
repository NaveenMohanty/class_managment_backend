var router = require("express").Router();
const { isAuthenticated, isSignedIn } = require("../controllers/auth");
const { getUserList } = require("../controllers/user");

/**
 * Instructor can access list of teachers,students and other instructors
 * Teacher can access list of students
 * student cannot access and user list
 * All this conditioning is done based on user role
 * pass the query as role to get user list of that role
 */
router.get("/user/list", isSignedIn, isAuthenticated, getUserList);

module.exports = router;
