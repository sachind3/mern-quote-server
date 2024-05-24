require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const connectDB = require("./config");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.set("trust proxy", 1);
if (process.env.NODE_ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
app.use(express.json());
app.use(
  cors({
    origin:
      process.env.ENVIRONMENT === "DEVELOPMENT"
        ? process.env.CLIENT_URI_DEV
        : process.env.CLIENT_URI_PROD,
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(cookieParser());

app.use("/user", require("./routes/userRoute"));
app.use("/quote", require("./routes/quoteRoute"));

const PORT = process.env.PORT || 5000;

connectDB();
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(process.env.ENVIRONMENT);
  console.log(`listening on port ${PORT}`);
});
