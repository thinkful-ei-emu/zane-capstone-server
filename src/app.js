require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const uuid = require("uuid/v4");
const UsersRouter = require("./users/users-router");
const authRouter = require("./auth/auth-router");
const inventoriesRouter = require("./Inventories/inventories-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "dev";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/users", UsersRouter);
app.use("/api/inventory", inventoriesRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
