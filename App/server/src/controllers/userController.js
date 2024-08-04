const userService = require('../services/userService.js');
const timerService = require('../services/timerService.js');

exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({message: 'Missing credentials'});
      return;
    }

    const result = await userService.registerUser(email, password);

    if (result.status === 201) {
      res.status(201).json(result); 
    } else {
      res.status(result.status).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
};
