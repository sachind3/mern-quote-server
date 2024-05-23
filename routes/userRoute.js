const router = require("express").Router();
const userController = require("../controllers/user-controller");
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");

router.post("/register", userController.register);
router.post("/activateEmail", userController.activateEmail);
router.post("/login", userController.login);
router.post("/refresh_token", userController.getAccessToken);
router.post("/forgotPassword", userController.forgotPassword);
router.post("/resetPassword", auth, userController.resetPassword);
router.get("/getUserInfo", auth, userController.getUserInfo);
router.get("/getAllUserInfo", auth, authAdmin, userController.getAllUserInfo);
router.get("/logout", userController.logout);

module.exports = router;
