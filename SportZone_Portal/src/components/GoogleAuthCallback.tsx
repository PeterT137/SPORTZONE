import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  useEffect(() => {
    const fetchGoogleData = async () => {
      try {
        const response = await axios.get('https://localhost:7057/api/Authentication/google-response', {
          withCredentials: true, // 👈 bắt buộc để cookie được gửi kèm
        });

        const { success, token, user, message } = response.data;

        if (success) {
          localStorage.setItem('token', token);
          showToast('Đăng nhập Google thành công!');
          console.log('Google user:', user);
        } else {
          showToast(message || 'Đăng nhập thất bại!', 'error');
        }

        navigate('/');
      } catch (err: any) {
        showToast(err?.response?.data?.message || 'Đăng nhập thất bại!', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleData();
  }, [navigate]);

  return <div className="text-center p-10 text-gray-600">Đang xử lý đăng nhập Google...</div>;
};

export default GoogleAuthCallback;
