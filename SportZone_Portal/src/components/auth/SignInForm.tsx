/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import axios from 'axios';

type ForgotStep = 'email' | 'otp' | 'new-password';

const SignInForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      setApiError('');
      const response = await axios.post('htpps://localhost:7057/api/Login', {
        uEmail: formData.email,
        uPassword: formData.password,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      console.log('Signed in user:', user);
    } catch (err: any) {
      setApiError(err?.response?.data || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setApiError('');
      const response = await axios.post('htpps://localhost:7057/api/GoogleLogin', {
        email: formData.email,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      console.log('Google login user:', user);
    } catch (err: any) {
      setApiError(err?.response?.data || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async () => {
    setLoading(true);
    setApiError('');
    try {
      await axios.post('htpps://localhost:7057/api/ForgotPassword/send-code', {
        email: forgotEmail,
      });
      setForgotStep('otp');
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Error sending code');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async () => {
    setLoading(true);
    setApiError('');
    if (newPassword !== confirmPassword) {
      setApiError("Passwords don't match");
      setLoading(false);
      return;
    }
    try {
      await axios.post('htpps://localhost:7057/api/ForgotPassword/verify-code', {
        code: otp,
        newPassword,
        confirmPassword,
      });
      alert('Password reset successful!');
      setShowForgotModal(false);
      setForgotStep('email');
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            className={`block w-full rounded-md border py-2 px-4 text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
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

        {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}

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
          disabled={loading}
          className="w-full bg-[#2f4f3f] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#24412f]"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-2 bg-white border border-gray-300 text-gray-800 py-2 rounded-full text-sm font-medium hover:bg-gray-100 flex items-center justify-center space-x-2"
        >
          <i className="fab fa-google"></i>
          <span>{loading ? 'Please wait...' : 'Sign in with Google'}</span>
        </button>
      </form>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
            {apiError && <p className="text-red-600 text-sm mb-3">{apiError}</p>}

            {forgotStep === 'email' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
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
                  <button
                    onClick={handleForgotPasswordSubmit}
                    disabled={loading}
                    className="text-sm px-4 py-2 bg-[#2f4f3f] text-white rounded"
                  >
                    {loading ? 'Sending...' : 'Send Code'}
                  </button>
                </div>
              </>
            )}

            {forgotStep === 'otp' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Enter OTP & New Password</h2>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  maxLength={6}
                />
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
                  <button onClick={() => setForgotStep('email')} className="text-sm px-4 py-2 bg-gray-200 rounded">
                    Back
                  </button>
                  <button
                    onClick={handleNewPasswordSubmit}
                    disabled={loading}
                    className="text-sm px-4 py-2 bg-[#2f4f3f] text-white rounded"
                  >
                    {loading ? 'Verifying...' : 'Verify & Save'}
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
