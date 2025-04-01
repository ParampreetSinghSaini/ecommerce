// middleware/auth.js
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'test@ecommerceWebsite12345'; // Must match the login secret

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(403).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(403).json({ message: 'Token not provided' });
//   console.log(token)
  jwt.verify(token, secret, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: 'Failed to authenticate token' });
    req.user = decoded; // Attach user info (including id) to request
    next();
  });
};
