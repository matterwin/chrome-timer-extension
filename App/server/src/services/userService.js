const admin = require('../config/firebaseAdmin');

exports.registerUser = async (email, password) => {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password
    });
    
    return { status: 201, userRecord: userRecord};
  } catch (error) {
    console.error('Error registering user'); 
    throw error;
  }
};
