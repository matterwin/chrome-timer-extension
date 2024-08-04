const { pool } = require('../config/db/localDB.js');

exports.saveTime = async (timerData) => {
  console.log(timerData);
  return timerData; 
};

// a lot more work for this
exports.deleteFolder = async (folder_id, owner_id, parent_folder_id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if the folder exists
    const findFolderQuery = `
      SELECT 1 FROM times.time_folders 
      WHERE id = $1
      AND folder_name != "root";
    `;
    const res = await client.query(findFolderQuery, [folder_id]);

    if (res.rowCount === 0) {
      await client.query('ROLLBACK');
      return { status: 400, message: 'Folder does not exist' };
    }

    // need to check if owner_id is real owner
    // ...

    // need to also delete all files apart of current folder
    const deleteFoldersQuery = `
      WITH RECURSIVE subfolders AS (
        SELECT id 
        FROM times.time_folders 
        WHERE id = $1
        UNION ALL
        SELECT tf.id
        FROM times.time_folders tf
        INNER JOIN subfolders sf ON tf.parent_folder_id = sf.id
      )
      DELETE FROM times.time_folders 
      WHERE id IN (SELECT id FROM subfolders)
      RETURNING id;
    `;
    const result = await client.query(deleteFoldersQuery, [folder_id]);

    await client.query('COMMIT');
    return { status: 200, deletedIds: result.rows.map(row => row.id), message: 'Folder(s) deleted successfully' };  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting folder(s):', error);
    return { status: 500, message: 'Internal Server Error' };
  } finally {
    client.release();
  }
};

exports.deleteFile = async (file_id, owner_id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if the folder exists
    const findFileQuery = `
      SELECT 1 FROM times.time_files 
      WHERE id = $1;
    `;
    const res = await client.query(findFolderQuery, [file_id]);

    if (res.rowCount === 0) {
      await client.query('ROLLBACK');
      return { status: 400, message: 'File does not exist' };
    }
    
    // need to check if owner_id is real owner
    // ...

    const deleteFileQuery = `
      DELETE FROM times.time_files 
      WHERE id = $1 RETURNING id;
    `;

    const result = await client.query(deleteFileQuery, [file_id]);

    await client.query('COMMIT');
    return { status: 200, id: result.rows[0].id, message: 'File deleted successfully' };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting file:', error);
    return { status: 500, message: 'Internal Server Error' };
  } finally {
    client.release();
  }
};

exports.createFolder = async (folder_name, owner_id, parent_folder_id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if parent folder exists
    const findParentFolder = `
      SELECT 1 FROM times.time_folders 
      WHERE id = $1;
    `;
    const res = await client.query(findParentFolder, [parent_folder_id]);

    if (res.rowCount === 0) {
      await client.query('ROLLBACK');
      return { status: 400, message: 'Parent folder does not exist' };
    }

    const findOwnerIdForParentFolder = `
      SELECT owner_id 
      FROM times.time_folders 
      WHERE id = $1;
    `;

    const ownerResult = await client.query(findOwnerIdForParentFolder, [parent_folder_id]);

    if (ownerResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return { status: 400, message: 'Parent folder does not have an owner' };
    }

    const ownerIdForParentFolder = ownerResult.rows[0].owner_id;

    if (owner_id !== ownerIdForParentFolder) {
      await client.query('ROLLBACK');
      return { status: 401, message: 'Unauthorized: you are not the owner of the directory.' };
    }

    // Check if folder with the same name exists in the current directory
    const findCurrentLevelFolderWithSameName = `
      SELECT 1 FROM times.time_folders 
      WHERE parent_folder_id = $1
      AND folder_name = $2; 
    `;
    const currentFoldersWithSameName = await client.query(findCurrentLevelFolderWithSameName, [parent_folder_id, folder_name]);

    if (currentFoldersWithSameName.rowCount > 0) {
      await client.query('ROLLBACK');
      return { status: 400, message: `Cannot create folder ${folder_name}: Folder exists` };
    }

    // Final insertion
    const insertFolderQuery = `
      INSERT INTO times.time_folders (folder_name, owner_id, parent_folder_id)
      VALUES ($1, $2, $3) RETURNING id
    `;

    const result = await client.query(insertFolderQuery, [folder_name, owner_id, parent_folder_id]);

    await client.query('COMMIT');
    return { status: 200, id: result.rows[0].id };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating folder:', error);
    return { status: 500, message: 'Internal Server Error' };
  } finally {
    client.release();
  }
};

exports.createRootFolder = async (uuid) => {
  try {
    const insertFolderQuery = `
      INSERT INTO times.time_folders (folder_name, owner_id)
      VALUES ($1, $2) RETURNING id
    `; 

    const result = await pool.query(insertFolderQuery, ['root', uuid]);

    return result.rows[0].id;
  } catch (error) {
    console.error(`Error creating root folder for ${uuid}`, error); 
    throw error;
  }
};

