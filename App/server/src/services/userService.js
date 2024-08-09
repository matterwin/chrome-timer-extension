const { pool } = require('../config/db/localDB.js');

exports.registerUser = async (uuid) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const findUserWithUUID = `
      SELECT 1 FROM auth.users 
      WHERE id = $1;
    `;
    const res = await client.query(findUserWithUUID, [uuid]);

    if (res.rowCount > 0) {
      await client.query('ROLLBACK');
      return { status: 400, message: `User with ${uuid} already exists` };
    }

    const createUserTuple = `
      INSERT INTO auth.users (id)
      VALUES ($1) RETURNING id;
    `;
    const userRes = await client.query(createUserTuple, [uuid]);
    const userId = userRes.rows[0].id; 

    await client.query('COMMIT');
    return { status: 201, userId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating folder:', error);
    return { status: 500, message: 'Internal Server Error' };
  } finally {
    client.release();
  }
};

exports.updateUserRootFolderId = async (uuid, rootFolderId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update the user's root_folder_id
    const updateUserQuery = `
      UPDATE auth.users
      SET root_folder_id = $1
      WHERE id = $2;
    `;
    await client.query(updateUserQuery, [rootFolderId, uuid]);

    await client.query('COMMIT');
    return { status: 200 };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating user with root folder ID:', error);
    return { status: 500, message: 'Internal Server Error' };
  } finally {
    client.release();
  }
};

