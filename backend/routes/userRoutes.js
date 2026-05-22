const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../controller/User");

router.post("/user", User.create);
router.post("/login", User.login);

router.get("/user", User.list);
router.get("/user/:id", auth, User.getById);

router.put("/user/:id", User.update);
router.delete("/user/:id", User.delete);

module.exports = router;
