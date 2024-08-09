CREATE SCHEMA times;


-- Time Folders __ 
CREATE TABLE times.time_folders (
  id SERIAL PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  owner_id VARCHAR(128) NOT NULL,
  parent_folder_id INT,
  FOREIGN KEY (parent_folder_id) REFERENCES times.time_folders(id)
);


-- Time Entries --
CREATE TABLE times.time_entries (
  id SERIAL PRIMARY KEY,
  hours_tracked VARCHAR(8) NOT NULL,
  owner_id VARCHAR(128) NOT NULL,
  folder_id INT,
  FOREIGN KEY (folder_id) REFERENCES times.time_folders(id)
);


CREATE SCHEMA auth;

-- Users --
CREATE TABLE auth.users (
  id VARCHAR(128) PRIMARY KEY,
  root_folder_id INT NULL,
  FOREIGN KEY (root_folder_id) REFERENCES times.time_folders(id)
);

