var router = require("express").Router();
const { Register, login, logout } = require("../controllers/auth");

router.post("/register", Register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
