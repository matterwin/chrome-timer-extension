import React from 'react';
import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';

const RedditTextField = styled((props) => (
  <TextField
    InputProps={{ disableUnderline: true }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiFilledInput-root': {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#FFFFE0',
    width: '100%',
    padding: '0px',
    height: '35px',
    '&:hover': {
      backgroundColor: '#FFFFE0' 
    },
    '&.Mui-focused': {
      backgroundColor: '#FFFFE0',
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
      borderColor: theme.palette.primary.main
    },
    '& input': {
      fontSize: '1.0rem', 
      paddingBottom: '0px'
    },
    '& .MuiFormLabel-asterisk': {
      display: 'none'
    },
  },
}));

export default RedditTextField;

