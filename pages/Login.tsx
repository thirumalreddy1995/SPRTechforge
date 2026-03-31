
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo, Button, Modal } from '../components/Components';
import { useNavigate, Link } from 'react-router-dom';

const PasswordInput: React.FC<{
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; autoComplete?: string;
}> = ({ label, value, onChange, placeholder, required, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-400 text-sm"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
          tabIndex={-1}
        >
          {show ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export const Login: React.FC = () => {
  const { login, updateUser, user, isCloudEnabled, cloudError, addPasswordResetRequest, showToast } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Password Change State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeErrors, setChangeErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  useEffect(() => {
    if (user && user.isPasswordChanged !== false) {
      navigate('/dashboard');
    } else if (user && user.isPasswordChanged === false) {
      setShowChangePassword(true);
    }
  }, [user, navigate]);

  const validateLoginForm = () => {
    const errs: typeof errors = {};
    if (!username.trim()) errs.username = 'Username is required';
    else if (!username.includes('@')) errs.username = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 4) errs.password = 'Password must be at least 4 characters';
    return errs;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateLoginForm();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    const result = await login(username, password);
    if (result.success) {
      showToast('Login successful');
      setIsLoading(false);
    } else {
      setErrors({ general: result.message || 'Invalid credentials. Please check your username and password.' });
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof changeErrors = {};
    if (!newPassword) errs.newPassword = 'New password is required';
    else if (newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
    else if (newPassword === user?.name) errs.newPassword = 'Password cannot be the same as your name';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (Object.keys(errs).length > 0) { setChangeErrors(errs); return; }
    setChangeErrors({});

    if (user) {
      updateUser({ ...user, password: newPassword, isPasswordChanged: true });
      showToast('Password updated successfully. Welcome!');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotUsername.trim()) { setForgotError('Please enter your username'); return; }
    if (!forgotUsername.includes('@')) { setForgotError('Please enter a valid email address'); return; }
    setForgotError('');
    addPasswordResetRequest(forgotUsername);
    setForgotMsg('Your reset request has been sent to the administrator. Please contact Thirumal Reddy for your new password.');
    setTimeout(() => { setShowForgotModal(false); setForgotMsg(''); setForgotUsername(''); }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Back to website */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-blue-300 hover:text-white transition-colors text-sm font-medium group">
            <svg className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Website
          </Link>
        </div>

        {/* Cloud error banner */}
        {cloudError && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 backdrop-blur-sm p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-red-300 font-semibold text-sm">Connectivity Issue</p>
                <p className="text-red-400 text-xs mt-0.5">{cloudError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-5 py-6 sm:px-8 sm:py-7 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <p className="text-blue-200 text-sm font-medium">
              {showChangePassword ? 'Secure your account' : 'Staff & Management Portal'}
            </p>
          </div>

          {/* Card Body */}
          <div className="px-5 py-6 sm:px-8 sm:py-7">
            {!showChangePassword ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
                <p className="text-gray-500 text-sm mb-6">Sign in to access your dashboard</p>

                {errors.general && (
                  <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
                    <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{errors.general}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                  {/* Username */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username / Email</label>
                    <input
                      type="email"
                      className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 focus:ring-2 outline-none transition-all placeholder-gray-400 text-sm ${errors.username ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'}`}
                      value={username}
                      onChange={e => { setUsername(e.target.value); if (errors.username) setErrors(p => ({ ...p, username: undefined })); }}
                      placeholder="name@sprtechforge.com"
                      autoComplete="username"
                    />
                    {errors.username && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.username}</p>}
                  </div>

                  {/* Password */}
                  <div className="mb-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <PasswordInput label="" value={password} onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }} placeholder="Enter your password" autoComplete="current-password" />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                  </div>

                  <div className="flex justify-end mb-5">
                    <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Authenticating...
                      </span>
                    ) : 'Sign In'}
                  </button>
                </form>
              </>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Set New Password</h2>
                <p className="text-gray-500 text-sm mb-6">This is your first login. Please set a secure password to continue.</p>

                <form onSubmit={handlePasswordUpdate} noValidate>
                  <div className="mb-1">
                    <PasswordInput label="New Password" value={newPassword} onChange={e => { setNewPassword(e.target.value); if (changeErrors.newPassword) setChangeErrors(p => ({ ...p, newPassword: undefined })); }} placeholder="Min. 6 characters" autoComplete="new-password" />
                    {changeErrors.newPassword && <p className="text-red-500 text-xs mt-1 font-medium -mt-3 mb-3">{changeErrors.newPassword}</p>}
                  </div>

                  <div className="mb-1">
                    <PasswordInput label="Confirm Password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); if (changeErrors.confirmPassword) setChangeErrors(p => ({ ...p, confirmPassword: undefined })); }} placeholder="Re-enter password" autoComplete="new-password" />
                    {changeErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium -mt-3 mb-3">{changeErrors.confirmPassword}</p>}
                  </div>

                  {/* Password strength hint */}
                  {newPassword && (
                    <div className="mb-4">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                            newPassword.length >= i * 3
                              ? newPassword.length >= 10 ? 'bg-emerald-500' : newPassword.length >= 7 ? 'bg-amber-500' : 'bg-red-400'
                              : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                        {newPassword.length < 6 ? 'Too short' : newPassword.length < 8 ? 'Weak — add more characters' : newPassword.length < 10 ? 'Moderate' : 'Strong password'}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 text-sm tracking-wide"
                  >
                    Update Password & Continue
                  </button>
                </form>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} SPR Techforge Pvt Ltd. All rights reserved.
              </p>
              {isCloudEnabled && (
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-600 font-semibold">Cloud Connected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal isOpen={showForgotModal} onClose={() => { setShowForgotModal(false); setForgotMsg(''); setForgotError(''); setForgotUsername(''); }} title="Reset Password Request">
        {!forgotMsg ? (
          <form onSubmit={handleForgotSubmit} noValidate>
            <p className="text-gray-600 text-sm mb-4">
              Enter your Login ID / email address. The administrator will be notified to reset your password.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Username / Email</label>
              <input
                type="email"
                className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 focus:ring-2 outline-none transition-all text-sm ${forgotError ? 'border-red-400 focus:ring-red-500/20' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'}`}
                value={forgotUsername}
                onChange={e => { setForgotUsername(e.target.value); setForgotError(''); }}
                placeholder="name@sprtechforge.com"
              />
              {forgotError && <p className="text-red-500 text-xs mt-1.5 font-medium">{forgotError}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowForgotModal(false)}>Cancel</Button>
              <Button type="submit">Send Reset Request</Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Request Sent</h3>
            <p className="text-gray-600 text-sm">{forgotMsg}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
