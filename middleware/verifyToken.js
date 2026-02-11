const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");

module.exports = function verifyToken(req, res, next) {
  const authHeader = req.header("Authorization");
  const queryToken = req.query.token;

  let token;
  if (authHeader) {
    token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ error: "Token missing or invalid." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token verification failed." });
  }
};