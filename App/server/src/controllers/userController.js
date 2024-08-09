const userService = require('../services/userService.js');
const timerService = require('../services/timerService.js');

exports.registerUser = async (req, res) => {
  try {
    const uuid = req.user.uid; 
    const userResult = await userService.registerUser(uuid);


    // registerUser should be 1 giant transaction, so that on failure it doesn't create a user without no root directory

    if (userResult.status !== 201) {
      res.status(userResult.status).json({ message: userResult.message });
      return;
    }

    console.log(`User ${uuid} successfully registered`);

    const folderResult = await timerService.createRootFolder(uuid);
    if (folderResult.status !== 201) {
      res.status(folderResult.status).json({ message: folderResult.message });
      return;
    }

    const updateResult = await userService.updateUserRootFolderId(uuid, folderResult.id);
    if (updateResult.status !== 200) {
      res.status(updateResult.status).json({ message: updateResult.message });
      return;
    }

    res.status(201).json({ message: `User ${uuid} successfully registered and root directory created` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
