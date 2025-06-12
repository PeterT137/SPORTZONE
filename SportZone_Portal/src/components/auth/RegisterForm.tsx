import React, { useState } from 'react';

interface RegisterFormProps {
  role: 'player' | 'manager';
}

interface RegisterFormData {
  username: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface FormErrors {
  username?: string;
  phone?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ role }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    phone: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Please confirm your password';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    console.log(`${role} Registration Form Submitted:`, formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Đăng ký - {role === 'player' ? 'Người chơi' : 'Quản lý sân'}
      </h3>

      {/* Username */}
      <div>
        <label
          htmlFor={`register-${role}-username`}
          className="block text-sm font-medium text-gray-500 mb-1"
        >
          Username
        </label>
        <input
          id={`register-${role}-username`}
          name="username"
          type="text"
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange}
          required
          className={`block w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-700 placeholder-gray-400 focus:border-[#2f4f3f] focus:ring-1 focus:ring-[#2f4f3f] focus:outline-none text-sm ${errors.username ? 'border-red-500' : ''}`}
        />
        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor={`register-${role}-phone`}
          className="block text-sm font-medium text-gray-500 mb-1"
        >
          Phone
        </label>
        <input
          id={`register-${role}-phone`}
          name="phone"
          type="tel"
          placeholder="0901234567"
          value={formData.phone}
          onChange={handleChange}
          required
          className={`block w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-700 placeholder-gray-400 focus:border-[#2f4f3f] focus:ring-1 focus:ring-[#2f4f3f] focus:outline-none text-sm ${errors.phone ? 'border-red-500' : ''}`}
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor={`register-${role}-email`} className="block text-sm font-medium text-gray-500 mb-1">
          E-mail
        </label>
        <input
          id={`register-${role}-email`}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={handleChange}
          required
          className={`block w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-700 placeholder-gray-400 focus:border-[#2f4f3f] focus:ring-1 focus:ring-[#2f4f3f] focus:outline-none text-sm ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor={`register-${role}-password`} className="block text-sm font-medium text-gray-500 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id={`register-${role}-password`}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="@#*%"
            value={formData.password}
            onChange={handleChange}
            required
            className={`block w-full rounded-md border border-gray-300 bg-white py-2 px-4 pr-12 text-gray-700 placeholder-gray-400 focus:border-[#2f4f3f] focus:ring-1 focus:ring-[#2f4f3f] focus:outline-none text-sm ${errors.password ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            aria-label="Toggle password visibility"
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            onClick={togglePassword}
          >
            <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor={`register-${role}-password-confirm`} className="block text-sm font-medium text-gray-500 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id={`register-${role}-password-confirm`}
            name="passwordConfirm"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="@#*%"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            className={`block w-full rounded-md border border-gray-300 bg-white py-2 px-4 pr-12 text-gray-700 placeholder-gray-400 focus:border-[#2f4f3f] focus:ring-1 focus:ring-[#2f4f3f] focus:outline-none text-sm ${errors.passwordConfirm ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            aria-label="Toggle confirm password visibility"
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            onClick={toggleConfirmPassword}
          >
            <i className={`far ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
        {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-[#2f4f3f] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#24412f] transition-colors"
      >
        Register as {role === 'player' ? 'Player' : 'Manager'}
      </button>
    </form>
  );
};

export default RegisterForm;
