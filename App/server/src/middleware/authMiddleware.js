const admin = require('../config/firebaseAdmin.js'); 

const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(' ')[1];

  if (!idToken || idToken === null) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  console.log("Received Token:", idToken);

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; 
    console.log("token verifed");
    next(); 
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyToken;

