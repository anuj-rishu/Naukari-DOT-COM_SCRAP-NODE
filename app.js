const express = require("express");
const jobRoutes = require("./routes/jobRoutes");
const errorHandler = require("./middleware/errorHandler");
const verifyToken = require("./middleware/verifyToken");
const cors = require("cors");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();

app.use(cors());
app.use(apiLimiter);
app.use(verifyToken);
app.use(express.json());

app.use("/api", jobRoutes);

app.use(errorHandler);

module.exports = app;
