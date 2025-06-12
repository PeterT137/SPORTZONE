import React, { useState } from 'react';

type ForgotStep = 'email' | 'otp' | 'new-password';

const SignInForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'At least 6 characters';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    console.log('Sign in:', formData);
  };

  const handleForgotPasswordSubmit = () => {
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) return;
    console.log('Email sent to:', forgotEmail);
    setForgotStep('otp');
  };

  const handleOtpSubmit = () => {
    if (otp.length === 6) {
      console.log('OTP verified:', otp);
      setForgotStep('new-password');
    }
  };

  const handleNewPasswordSubmit = () => {
    if (!newPassword || newPassword.length < 6) return;
    if (newPassword !== confirmPassword) return;
    console.log('Password reset success');
    setShowForgotModal(false);
    setForgotStep('email');
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* Email */}
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
            className={`block w-full rounded-md border py-2 px-4 text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
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
              className={`block w-full rounded-md border py-2 px-4 pr-12 text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={togglePassword}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <label className="flex items-center space-x-2">
            <input
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-3.5 h-3.5"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-[#2f4f3f] font-semibold underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-[#2f4f3f] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#24412f]"
        >
          Sign in
        </button>
      </form>

      {/* Modal Forgot Password */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
            {/* Email Step */}
            {forgotStep === 'email' && (
              <>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Reset Password</h2>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowForgotModal(false)} className="text-sm px-4 py-2 bg-gray-200 rounded">
                    Cancel
                  </button>
                  <button onClick={handleForgotPasswordSubmit} className="text-sm px-4 py-2 bg-[#2f4f3f] text-white rounded">
                    Send Link
                  </button>
                </div>
              </>
            )}

            {/* OTP Step */}
            {forgotStep === 'otp' && (
              <>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Enter OTP</h2>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  maxLength={6}
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setForgotStep('email')} className="text-sm px-4 py-2 bg-gray-200 rounded">
                    Back
                  </button>
                  <button onClick={handleOtpSubmit} className="text-sm px-4 py-2 bg-[#2f4f3f] text-white rounded">
                    Verify
                  </button>
                </div>
              </>
            )}

            {/* New Password Step */}
            {forgotStep === 'new-password' && (
              <>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Set New Password</h2>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setForgotStep('otp')} className="text-sm px-4 py-2 bg-gray-200 rounded">
                    Back
                  </button>
                  <button onClick={handleNewPasswordSubmit} className="text-sm px-4 py-2 bg-[#2f4f3f] text-white rounded">
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SignInForm;
