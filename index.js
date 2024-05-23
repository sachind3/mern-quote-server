require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/user", require("./routes/userRoute"));
app.use("/quote", require("./routes/quoteRoute"));

const PORT = process.env.PORT || 5000;

connectDB();
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
