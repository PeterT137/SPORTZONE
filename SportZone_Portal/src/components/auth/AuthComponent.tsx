import React, { useState } from 'react';
import SignInForm from './SignInForm';
import RegisterForm from './RegisterForm';
import RoleModal from './RoleModal';
import RightSide from './RightSide';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register-player' | 'register-manager'>('signin');
  const [showModal, setShowModal] = useState(false);

  const handleTabChange = (tab: 'signin' | 'register') => {
    if (tab === 'signin') {
      setActiveTab('signin');
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  };

  const handleRoleSelect = (role: 'player' | 'manager') => {
    setShowModal(false);
    setActiveTab(role === 'player' ? 'register-player' : 'register-manager');
  };

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
              onClick={() => handleTabChange('signin')}
            >
              Sign in
            </button>
            <button
              className={`pb-3 ${activeTab.includes('register') ? 'border-b-4 border-[#2f4f3f] text-[#2f4f3f]' : 'text-gray-500'} hover:text-[#2f4f3f] focus:outline-none`}
              onClick={() => handleTabChange('register')}
            >
              Register
            </button>
          </nav>
          {activeTab === 'signin' && <SignInForm />}
          {activeTab === 'register-player' && <RegisterForm role="player" />}
          {activeTab === 'register-manager' && <RegisterForm role="manager" />}
          <div className="flex items-center my-8 space-x-3 text-gray-300 text-xs">
            <hr className="flex-grow border-gray-300" />
            <span>OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>
          <button className="w-full flex items-center justify-center space-x-3 border border-gray-300 rounded-full py-2.5 text-gray-600 text-sm hover:bg-gray-100 transition">
            <img
              alt="Google logo, multicolor G letter on white background"
              className="w-5 h-5"
              src="https://storage.googleapis.com/a1aa/image/d607ce76-a42a-46f8-d08b-08309f91f61b.jpg"
              width="20"
              height="20"
            />
            <span>Continue with Google</span>
          </button>
          <button className="w-full flex items-center justify-center space-x-3 border border-gray-300 rounded-full py-2.5 mt-4 text-gray-600 text-sm hover:bg-gray-100 transition">
            <img
              alt="Facebook logo, white letter f on blue background"
              className="w-5 h-5"
              src="https://storage.googleapis.com/a1aa/image/23216201-7d9b-4c30-0cfc-cdf289fa967f.jpg"
              width="20"
              height="20"
            />
            <span>Continue with Facebook</span>
          </button>
        </div>
      </div>
      <RightSide />
      {showModal && <RoleModal onRoleSelect={handleRoleSelect} />}
    </div>
  );
};

export default App;