var router = require("express").Router();
const { isAuthenticated, isSignedIn } = require("../controllers/auth");
const { getUserList } = require("../controllers/user");

router.get("/user/list", isSignedIn, isAuthenticated, getUserList);

module.exports = router;
