const userService = require('../services/userService.js');
const timerService = require('../services/timerService.js');

exports.registerUser = async (req, res) => {
  try {
    const { uuid } = req.body;
    if (!uuid) {
      res.status(400).json({message: 'Missing credentials'});
      return;
    }

    const rootFolderCreation = await timerService.createRootFolder(uuid);
    if (!rootFolderCreation) {
      res.status(400).json({ message: 'Error creating root folder' }); 
    }
    res.status(201).json({ message: 'Success. Created root folder for user' });
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
};
