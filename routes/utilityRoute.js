const utilityController = require("../controllers/utility-controller");
const auth = require("../middlewares/auth");

const router = require("express").Router();

router.post("/like/:id", auth, utilityController.likeQuote);
router.post("/saved/:id", auth, utilityController.saveQuote);
router.get("/like", auth, utilityController.getLikedQuotes);
router.get("/saved", auth, utilityController.getSavedQuotes);
module.exports = router;
