import React from 'react';

const RightSide: React.FC = () => {
  const handleSupportClick = () => {
    console.log('Support button clicked');
  };

  return (
    <div className="w-full h-full bg-[#2f4f3f] flex flex-col justify-between px-8 py-10 text-white overflow-hidden">
      {/* Top Support Button */}
      <div className="flex justify-end">
        <button
          className="flex items-center gap-2 text-white text-sm hover:underline"
          onClick={handleSupportClick}
        >
          <i className="fas fa-headset"></i>
          <span>Support</span>
        </button>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <img
          src="https://storage.googleapis.com/a1aa/image/53b116e7-3417-44b1-c894-eaa9f5d55c22.jpg"
          alt="Soccer field"
          className="rounded-md mb-6 w-full max-w-md"
        />
        <h2 className="text-2xl font-semibold mb-3">Introducing new features</h2>
        <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
          Analyzing previous trends ensures that businesses always make the right decision. And as
          the scale of the decision and its impact magnifies...
        </p>
      </div>

      {/* Bottom Slide Dots */}
      <div className="flex justify-center space-x-3 mt-6 text-gray-400 text-xs select-none">
        <span>&lt;</span>
        <span>•</span>
        <span className="text-white">●</span>
        <span>•</span>
        <span>&gt;</span>
      </div>
    </div>
  );
};

export default RightSide;
