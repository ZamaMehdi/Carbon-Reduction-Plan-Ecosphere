import React from 'react';
import api from '../api/axiosConfig';

const Header = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout'); // Adjust this route if your backend is different
      onLogout(); // This sets userInfo to null in App.jsx
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 w-full">
    <div className="w-full sm:w-auto flex justify-center sm:justify-start">
      <img
        src="/carbonreductionplanning.png"
        alt="Carbon Reduction Planning"
        className="max-h-40 sm:max-h-52 w-auto object-contain"
      />
    </div>
    <div className="w-full sm:w-auto flex justify-end">
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  </header>
  
  );
};

export default Header;
