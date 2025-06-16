import React from 'react';

interface RoleModalProps {
  onRoleSelect: (role: 'player' | 'manager') => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ onRoleSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-sm w-full p-6 text-center">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Bạn là người chơi hay quản lý sân?
        </h3>
        <div className="flex justify-center space-x-6">
          <button
            className="bg-[#2f4f3f] text-white py-2 px-6 rounded-full font-semibold hover:bg-[#24412f] transition"
            onClick={() => onRoleSelect('player')}
            aria-label="Register as Player"
          >
            Người chơi
          </button>
          <button
            className="bg-[#2f4f3f] text-white py-2 px-6 rounded-full font-semibold hover:bg-[#24412f] transition"
            onClick={() => onRoleSelect('manager')}
            aria-label="Register as Manager"
          >
            Quản lý sân
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;