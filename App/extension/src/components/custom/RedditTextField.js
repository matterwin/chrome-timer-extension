import React from 'react';
import { alpha, styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

const RedditTextField = styled((props) => (
  <TextField
    InputProps={{ disableUnderline: true }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiFilledInput-root': {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#fffff0',
    width: '100%',
    height: '50px',
    '&:hover': {
      backgroundColor: '#fffff0',
    },
    '&.Mui-focused': {
      backgroundColor: '#fffff0',
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
      borderColor: theme.palette.primary.main,
    },
    '& input': {
      fontSize: '15px',
      color: 'darkgreen'
    },
    '& .MuiFormLabel-asterisk': {
      display: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'grey', 
    fontSize: '15px',
    paddingBottom: '10px',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'green', 
    fontSize: '15px'
  },
}));

export default RedditTextField;

