import React, { useState } from 'react';
import SignInForm from './SignInForm';
import RegisterForm from './RegisterForm';
import RightSide from './RightSide';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  return (
    <div className="min-h-screen bg-[#f5fafc] flex flex-col md:flex-row">
      {/* Left side: Sign In and Register Tabs */}
      <div className="bg-[#f5fafc] flex flex-col justify-center px-6 py-10 md:px-16 md:py-20 w-full md:w-1/2">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <span className="inline-block border-l-4 border-[#2f4f3f] pl-2 text-[#2f4f3f] font-normal text-lg">
              Logo
            </span>
          </div>
          <nav className="flex space-x-8 border-b border-gray-300 text-gray-500 text-sm font-semibold">
            <button
              className={`pb-3 ${activeTab === 'signin' ? 'border-b-4 border-[#2f4f3f] text-[#2f4f3f]' : 'text-gray-500'} focus:outline-none`}
              onClick={() => setActiveTab('signin')}
            >
              Sign in
            </button>
            <button
              className={`pb-3 ${activeTab === 'register' ? 'border-b-4 border-[#2f4f3f] text-[#2f4f3f]' : 'text-gray-500'} hover:text-[#2f4f3f] focus:outline-none`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </nav>

          {activeTab === 'signin' && <SignInForm />}
          {activeTab === 'register' && <RegisterForm role="player" />} {/* Mặc định là player */}
        </div>
      </div>

      <RightSide />
    </div>
  );
};

export default App;
