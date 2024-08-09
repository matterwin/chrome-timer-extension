const timerService = require('../services/timerService.js');

exports.saveTime = async (req, res) => {
  try {
    const newUser = await timerService.saveTime(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
};

exports.createFolder = async (req, res) => {
  try {
    const { folder_name, owner_id, parent_folder_id} = req.body;
    if (!folder_name) {
      res.status(400).json({ message: 'folder_name is required' });
      return;
    }

    if (!owner_id) {
      res.status(400).json({ message: 'owner_id is required' });
      return;
    }

    if (!parent_folder_id) {
      res.status(400).json({ message: 'parent_folder_id is required' });
      return;
    }

    const folder = await timerService.createFolder(folder_name, owner_id, parent_folder_id);

    if (folder.status != 201) {
      res.status(folder.status).json({ message: folder.message });
      return;
    }

    res.status(201).json({ id: folder.id, message: `Created folder: ${folder_name}`})
  } catch (error) {
     res.status(500).json({ message: error.message });   
  }
};
