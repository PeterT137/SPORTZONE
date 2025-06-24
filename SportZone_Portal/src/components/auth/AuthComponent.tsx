import React, { useState } from 'react';
import SignInForm from './SignInForm';
import RegisterForm from './RegisterForm';
import RightSide from './RightSide';
import Header from '../Header';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Nội dung dưới header: flex-grow để chiếm toàn bộ phần còn lại */}
      <div className="flex flex-grow">
        {/* Left Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-[#f5fafc] px-6">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-[#2f4f3f]">Welcome to Our App</h1>
              <p className="text-gray-500 text-sm">Sign in or register to continue</p>
            </div>

            <div className="flex space-x-6 mb-6 border-b border-gray-200 justify-center">
              <button
                className={`pb-2 font-medium text-sm ${
                  activeTab === 'signin'
                    ? 'border-b-4 border-[#2f4f3f] text-[#2f4f3f]'
                    : 'text-gray-400 hover:text-[#2f4f3f]'
                }`}
                onClick={() => setActiveTab('signin')}
              >
                Sign In
              </button>
              <button
                className={`pb-2 font-medium text-sm ${
                  activeTab === 'register'
                    ? 'border-b-4 border-[#2f4f3f] text-[#2f4f3f]'
                    : 'text-gray-400 hover:text-[#2f4f3f]'
                }`}
                onClick={() => setActiveTab('register')}
              >
                Register
              </button>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              {activeTab === 'signin' ? <SignInForm /> : <RegisterForm role="player" />}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-1/2 hidden md:flex">
          <RightSide />
        </div>
      </div>
    </div>
  );
};

export default App;
