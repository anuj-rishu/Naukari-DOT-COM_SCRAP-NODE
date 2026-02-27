module.exports = function verifyToken(req, res, next) {
  const authHeader = req.header("Authorization");
  const tokenHeader = req.header("token");
  const queryToken = req.query.token;

  let token;
  if (authHeader) {
    token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;
  } else if (tokenHeader) {
    token = tokenHeader.startsWith("Bearer ")
      ? tokenHeader.substring(7)
      : tokenHeader;
  } else if (queryToken) {
    token = queryToken;
  }

  if (
    !token ||
    token === "undefined" ||
    token === "null" ||
    !token.includes("zccpn=") ||
    !token.includes("zalb_")
  ) {
    return res.status(401).json({ error: "Token missing or invalid format." });
  }

  req.token = token;
  next();
};
