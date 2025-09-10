import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full text-center py-8">
      <div className="container mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
          VisionVoice
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          Multilingual Visual Aid for the Visually Impaired
        </p>
      </div>
    </header>
  );
};

export default Header;