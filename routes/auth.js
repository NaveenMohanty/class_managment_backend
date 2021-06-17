var router = require("express").Router();
const { Register, login, logout } = require("../controllers/auth");

// User can register given its details
router.post("/register", Register);

// User can loging given its email password
router.post("/login", login);

// User can logout
router.get("/logout", logout);

module.exports = router;
