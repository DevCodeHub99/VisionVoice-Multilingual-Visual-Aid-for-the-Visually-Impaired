
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-gray-800 p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-center">
        <i className="fa-solid fa-eye text-amber-400 text-3xl mr-4"></i>
        <h1 className="text-3xl font-bold text-white tracking-wider">
          Multilingual Visual Aid
        </h1>
      </div>
    </header>
  );
};

export default Header;
