import React, { useState } from 'react';
import {
  goBack,
  goTo,
  popToTop,
  Link,
  Router,
  getCurrent,
  getComponentStack,
} from 'react-chrome-extension-router';
import Fab from '@mui/material/Fab';
import ForwardRoundedIcon from '@mui/icons-material/ForwardRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import CToolTip from '../../components/CToolTip.js';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded';

import { styled, alpha } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import useTimer from '../../hooks/useTimer.js';
import './FileSystem.css';

const Header = ({ path, setPath }) => {
  const handleBackward = () => {
    goBack();
  };

  const handleGoToTimer = () => {
    popToTop();
  };

  return (
    <div style={{ padding: '10px' }}>
      <div className="headerDiv">
        <div className="headerRowDivs">
          <Fab 
            sx={{ 
              bgcolor: 'transparent', 
              color: 'grey',
              boxShadow: 'none',
              borderRadius: '100%',
              '&:hover': {
                bgcolor: '#2a3439',
              },
              margin: '0 10px'
            }} 
            aria-label='GoBack' 
            onClick={handleBackward}
          >
            <ForwardRoundedIcon sx={{ transform: 'scaleX(-1)', fontSize: '35px' }}/>
          </Fab> 
          <div style={{ paddingLeft: 5, paddingRight: 5, paddingTop: 2, paddingBottom: 2, backgroundColor: '#212121', borderRadius: '5px' }}>
            <h3 style={{ color: '#FFFFE0' }}>{path}</h3>
          </div>
        </div>
        <div className="headerRowDivs">
          <Fab 
            variant="extended"
            sx={{ 
              borderRadius: '5px',
              bgcolor: 'transparent', 
              color: 'green',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'darkgreen',
              },
              margin: '0 10px',
              textTransform: 'none'
            }} 
            aria-label='Timer' 
          >
            <p className="timerInFileSystem">Add folder</p>
          </Fab>
          <Fab 
            variant="extended"
            sx={{ 
              borderRadius: '5px',
              bgcolor: 'transparent', 
              color: '#2a3439',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'grey',
              },
              margin: '0 10px'
            }} 
            aria-label='Timer' 
            onClick={handleGoToTimer}
          >
            <p className="timerInFileSystem">00 00 00</p>
          </Fab>
        </div>
      </div>
    </div>
  );
};

const DirectoryInfoHeader = () => {
  return (
    <div className="directoryDiv" style={{ cursor: 'normal' }}>
      <div className="columnTitleDiv">
        <p>Identifier</p>
      </div>
      <div className="columnTitleDiv">
        <p>Date</p>
      </div>
      <div className="columnTitleDiv">
        <p>Type</p>
      </div>
      <div className="columnTitleDiv">
        <p>Compiled time</p>
      </div>
    </div>
  );
};

const Row = ({ type, identifer, date, localTime, bgColor }) => {
  const [hover, setHover] = useState(false);
  const [color, setColor] = useState(bgColor);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const [identiferState, setIdentiferState] = useState(identifer);
  const [dateState, setDateState] = useState(date);
  const [localTimeState, setLocalTimeState] = useState(localTime || null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    handleOnMouseLeave();
  };

  const handleOnMouseEnter = () => {
    setColor('grey');
    setHover(true);
  };

  const handleOnMouseLeave = () => {
    setColor(bgColor);
    setHover(false);
  };

  const handleDoubleClicked = () => {
    alert("route to clicked folder");
  };

  return (
    <div 
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      onClick={() => setColor('grey')}
      onDoubleClick={handleDoubleClicked}
      className="directoryDiv" 
      style={{ backgroundColor: color }}
    >
      <div className="columnTitleDiv iconRow">
        { type === 'Folder' ? 
          <FolderRoundedIcon sx={{ fontSize: '15px', padding: 0, margin: 0 }}/> 
          :
          <AlarmRoundedIcon sx={{ fontSize: '15px', padding: 0, margin: 0 }}/>
        }
        <p>{ identiferState }</p>
      </div>
      <div className="columnTitleDiv">
        <p>{ dateState }</p>
      </div>
      <div className="columnTitleDiv">
        <p>{ type }</p>
      </div>
      <div className="columnTitleDiv">
        <p>{ localTimeState }</p>
      </div>
      <div className="columnTitleEditDiv">
        { hover && 
          <Fab 
            sx={{ 
              bgcolor: 'rgba(0, 0, 0, 0.15)', 
              color: 'grey',
              boxShadow: 'none',
              borderRadius: '50%',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.50)',
              },
              minWidth: '25px',
              minHeight: '25px',
              width: '30px',  
              height: '30px'
            }} 
            aria-label='GoBack' 
            onClick={handleClick}
          >
            <MoreVertIcon  sx={{ fontSize: '20px', color: 'white' }}/>
          </Fab> 
        }
        <StyledMenu
          id="demo-customized-menu"
          MenuListProps={{
              'aria-labelledby': 'demo-customized-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          disableScrollLock={true}
        >
          { type === 'Folder' &&
            <MenuItem onClick={handleClose} disableRipple>
              <p>Rename Folder</p>
            </MenuItem>
          }
          <MenuItem onClick={handleClose} disableRipple>
            {type === 'Folder' ? <p>Delete Folder</p> : <p>Delete Time</p>}
          </MenuItem>
        </StyledMenu>
      </div>
    </div>
  );
};

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 5,
    border: '1px solid #fffff0',
    margin: 0,
    minWidth: 100,
    backgroundColor: '#292A2D',
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.15)',
    '& .MuiMenu-list': {},
    '& .MuiMenuItem-root': {
      color: '#fffff0',
      fontSize: '10px',
      fontWeight: '700',
      padding: 0,
      paddingLeft: 10,
      margin: 0,
      '& .MuiSvgIcon-root': {},
      '&:active': {
        backgroundColor: 'rgba(0, 0, 0, 0.15)' 
      },
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        color: '#fffff0',
      },
    },
  },
}));

const Footer = () => {
  return (
    <div className="footerDiv">
      <div className="columnTitleDiv">
        <p></p>
      </div>
      <div className="columnTitleDiv">
        <p></p>
      </div>
      <div className="columnTitleDiv">
        <p></p>
      </div>
      <div className="columnTitleDiv">
        <p>00 00 00</p>
      </div>
    </div>
  );
};

const FileSystem = () => {
  const [path, setPath] = useState('./root');

  return (
    <div className="page-container">
      <div className="console-container">
        <div className="header">
          <Header path={path} setPath={setPath} />
          <DirectoryInfoHeader />
        </div>
        <div className="middle">
          <Row 
            type="Folder" 
            identifer="folder yap" 
            date="Aug 3, 2024" 
            desc="testing desc" 
            localTime="12 02 33" 
            bgColor="#47686e"
          />
          <Row 
            type="Time" 
            identifer="02 03 10" 
            date="Mar 3, 2024" 
            desc="testing desc for time" 
            localTime="---"
            bgColor="#78a7b0"
          />
          <Row 
            type="Folder" 
            identifer="folder yap" 
            date="Aug 3, 2024" 
            desc="testing desc" 
            localTime="12 02 33" 
            bgColor="#47686e"
          />
          <Row 
            type="Time" 
            identifer="02 03 10" 
            date="Mar 3, 2024" 
            desc="testing desc for time" 
            localTime="---"
            bgColor="#78a7b0"
          />
          <Row 
            type="Time" 
            identifer="02 03 10" 
            date="Mar 3, 2024" 
            desc="testing desc for time" 
            localTime="---"
            bgColor="#47686e"
          />
        </div>
        <div className="footer">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default FileSystem;
