import { API_IP_ADDRESS } from './apiConfig.js';
import { useSelector } from 'react-redux';

const baseURL = `http://${API_IP_ADDRESS}/user`;

export const register = async (token) => {
  try {
    const res = await fetch(`${baseURL}/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await res.json();
    return { status: res.status, data };
  } catch (error) {
    console.error(error);
    return { status: 500, error: error.message };
  }
};
