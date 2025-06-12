import React from 'react';

const RightSide: React.FC = () => {
  const handleSupportClick = () => {
    // Placeholder for support action (e.g., open chat or redirect)
    console.log('Support button clicked');
    // Example: window.location.href = '/support';
  };

  return (
    <div className="bg-[#2f4f3f] flex flex-col justify-between px-6 py-10 md:px-16 md:py-20 w-full md:w-1/2 text-white relative overflow-hidden">
      <div className="flex justify-end mb-12">
        <button
          className="flex items-center space-x-2 text-white text-sm font-normal hover:underline focus:outline-none"
          onClick={handleSupportClick}
          aria-label="Contact support"
        >
          <i className="fas fa-headset"></i>
          <span>Support</span>
        </button>
      </div>
      <div className="max-w-lg mx-auto">
        <img
          alt="Soccer ball on grass field with goal and trees in background during sunset"
          className="w-full rounded-md mb-8"
          src="https://storage.googleapis.com/a1aa/image/53b116e7-3417-44b1-c894-eaa9f5d55c22.jpg"
          width="600"
          height="300"
        />
        <h2 className="text-2xl font-semibold mb-4">Introducing new features</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Analyzing previous trends ensures that businesses always make the right decision. And as
          the scale of the decision and it’s impact magnifies...
        </p>
      </div>
      <div className="flex justify-center space-x-3 mt-12 text-gray-400 text-xs select-none">
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