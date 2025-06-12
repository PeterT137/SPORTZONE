import React, { useState } from 'react';

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const SignInForm: React.FC = () => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
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
    // Placeholder for API call
    console.log('Sign-In Form Submitted:', formData);
    // Example: await fetch('/api/signin', { method: 'POST', body: JSON.stringify(formData) });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="signin-email" className="block text-sm font-medium text-gray-500 mb-1">
          E-mail
        </label>
        <input
          id="signin-email"
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
      <div>
        <label htmlFor="signin-password" className="block text-sm font-medium text-gray-500 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="signin-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
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
      <div className="flex items-center justify-between text-xs text-gray-400">
        <label className="flex items-center space-x-2">
          <input
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-3.5 h-3.5 border border-gray-300 rounded text-[#2f4f3f] focus:ring-[#2f4f3f]"
          />
          <span>Remember me</span>
        </label>
        <a href="#" className="font-semibold text-[#2f4f3f] underline">
          Forgot Password?
        </a>
      </div>
      <button
        type="submit"
        className="w-full bg-[#2f4f3f] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#24412f] transition-colors"
      >
        Sign in
      </button>
    </form>
  );
};

export default SignInForm;