const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // expects: "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // from your .env
    req.user = decoded; // attaches user info (e.g., id, email, userType)
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
