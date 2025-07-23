import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface RegisterFormProps {
  role: 'player' | 'fieldOwner';
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ role }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const roleIdMap: Record<RegisterFormProps['role'], number> = {
    player: 2,
    fieldOwner: 3,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): Partial<FormData> => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (
      formData.password.length < 10 ||
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
    ) {
      newErrors.password =
        'Password must be at least 10 characters and include uppercase, lowercase, and special character';
    }
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

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

    setLoading(true);
    try {
      await axios.post('https://localhost:7057/api/Register', {
        roleId: roleIdMap[role],
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage('Registration successful! You can now sign in.');
      setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
      showToast('Registration successful!', 'success');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.response?.data?.message || 'Đã xảy ra lỗi không xác định';
      setApiError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5 mt-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-[#2f4f3f] capitalize">
        Đăng ký với vai trò {role === 'fieldOwner' ? 'Chủ sân' : 'Người chơi'}
      </h2>

      {apiError && <p className="text-sm text-red-600">{apiError}</p>}
      {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Tên</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded text-sm ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded text-sm ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded text-sm ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Mật khẩu</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded text-sm ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Xác nhận mật khẩu</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded text-sm ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#2f4f3f] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#24412f] disabled:opacity-50"
      >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
      </button>
    </form>
  );
};

export default RegisterForm;