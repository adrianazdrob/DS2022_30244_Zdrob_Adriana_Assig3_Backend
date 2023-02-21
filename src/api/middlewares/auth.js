const jwt = require('jsonwebtoken');
const {TOKEN} = require("../constants");
const config = process.env;

const verifyToken = (req, res, next) => {
  const { body, query, headers} = req;
  const token = body.token || query.token || headers["authorization"]?.split(" ")[1];

  if(!token) {
    return res.status(403).json({
      error: "Unauthorized"
    });
  }

  try {
    req.user = jwt.verify(token, config.TOKEN_KEY || TOKEN);
  } catch(err) {
    return res.status(401).json({
      error: 'Invalid token'
    })
  }
  return next();
}

module.exports = verifyToken;