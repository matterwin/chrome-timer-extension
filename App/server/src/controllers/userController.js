const userService = require('../services/userService.js');

exports.registerUser = async (req, res) => {
  try {
    const newUser = await userService.registerUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
};
