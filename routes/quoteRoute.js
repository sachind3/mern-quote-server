const quoteController = require("../controllers/quote-controller");
const auth = require("../middlewares/auth");

const router = require("express").Router();

router.post("/create", auth, quoteController.createQuote);
router.get("/getAllQuotes", quoteController.getAllQuotes);
router.get("/getMyQuotes", auth, quoteController.getMyQuotes);
router.get("/getSingleQuote/:id", quoteController.getSingleQuote);
router.delete("/deleteQuote/:id", auth, quoteController.deleteQuote);
router.patch("/updateQuote/:id", auth, quoteController.updateQuote);
router.get("/author/:id", quoteController.getAuthorQuotes);
router.get("/search", quoteController.searchQuotes);
module.exports = router;
