import { useState, useEffect, useRef } from 'react';

const useFileSys = () => {
  const [filesys, setFilesys] = useState(null);
  const portRef = useRef(null);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'filesys' });
    portRef.current = port;

    port.onMessage.addListener((msg) => {
      // Handle incoming messages here, if necessary
    });

    return () => {
      if (portRef.current) {
        portRef.current.disconnect();
      }
    };
  }, []); 

  const getAllFoldersAndFiles = () => {
    portRef.current?.postMessage({ action: 'getAllFoldersAndFiles' });
  };

  const getCurrentDirectory = () => {
    portRef.current?.postMessage({ action: 'getCurrentDirectory' });
  };

  const updateFile = (file) => {
    portRef.current?.postMessage({ action: 'updateFile', file });
  };

  const updateFolder = (folder) => {
    portRef.current?.postMessage({ action: 'updateFolder', folder });
  };

  const deleteFolder = (folderId) => {
    portRef.current?.postMessage({ action: 'deleteFolder', folderId });
  };

  const deleteFile = (fileId) => {
    portRef.current?.postMessage({ action: 'deleteFile', fileId });
  };

  const createFolder = (folderName) => {
    portRef.current?.postMessage({ action: 'createFolder', folderName });
  };

  const createFile = (fileName) => {
    portRef.current?.postMessage({ action: 'createFile', fileName });
  };

  return { 
    getAllFoldersAndFiles,
    getCurrentDirectory,
    updateFile,
    updateFolder,
    deleteFolder,
    deleteFile,
    createFolder,
    createFile
  };
};

export default useFileSys;

