import React from 'react';
import api from '../api/axiosConfig'; // your configured axios instance with withCredentials: true

const TestCookie = () => {
  const sendTest = async () => {
    try {
      const res = await api.get('http://localhost:5000/test-set-cookie', {
        withCredentials: true,
      });
      alert('Test cookie sent!');
      console.log(res.data);
    } catch (err) {
      console.error('❌ Error sending test cookie:', err);
    }
  };

  return (
    <button
      onClick={sendTest}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Send Test Cookie
    </button>
  );
};

export default TestCookie;
