import { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaEyeSlash, FaLock, FaEnvelope, FaSignInAlt, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../src/contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { login } = useAuth();

  // Animation effect
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        onClose();
        // Reset form
        setFormData({ email: '', password: '' });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setError('');
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-gradient-to-b from-netflix-black to-netflix-dark border border-netflix-gray/30 rounded-xl w-full max-w-md shadow-2xl transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Header */}
        <div className="relative p-8 pb-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-netflix-text-gray hover:text-netflix-white transition-colors duration-200"
          >
            <FaTimes size={20} />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-netflix-red/20 rounded-full mb-4">
              <FaSignInAlt className="text-netflix-red text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-netflix-white mb-2">Welcome Back</h2>
            <p className="text-netflix-text-gray">Sign in to continue your streaming experience</p>
          </div>
        </div>

        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-netflix-white text-sm font-medium">
                Email Address
              </label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-netflix-text-gray group-focus-within:text-netflix-red transition-colors duration-200" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-netflix-gray/30 border border-netflix-gray/50 rounded-lg pl-12 pr-4 py-4 text-netflix-white focus:border-netflix-red focus:outline-none focus:ring-2 focus:ring-netflix-red/20 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-netflix-white text-sm font-medium">
                Password
              </label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-netflix-text-gray group-focus-within:text-netflix-red transition-colors duration-200" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-netflix-gray/30 border border-netflix-gray/50 rounded-lg pl-12 pr-12 py-4 text-netflix-white focus:border-netflix-red focus:outline-none focus:ring-2 focus:ring-netflix-red/20 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-netflix-text-gray hover:text-netflix-white transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-2">
                  <FaInfoCircle className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full bg-gradient-to-r from-netflix-red to-red-600 hover:from-netflix-red/90 hover:to-red-600/90 disabled:from-netflix-gray/50 disabled:to-netflix-gray/50 disabled:cursor-not-allowed text-netflix-white py-4 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-netflix-red/50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <FaSignInAlt />
                  <span>Sign In</span>
                </div>
              )}
            </button>
          </form>

          {/* Access Information */}
          <div className="mt-8 p-4 bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <FaInfoCircle className="text-netflix-red flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-netflix-white font-medium mb-2">Need Access?</h4>
                <p className="text-netflix-text-gray text-sm mb-3">
                  NetFlex is currently in closed beta. New accounts are created by administrators only.
                </p>
                <p className="text-netflix-white text-sm">
                  Contact <span className="text-netflix-red font-medium">admin@netflex.com</span> to request an invitation.
                </p>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-3 text-center">Demo Accounts</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-netflix-gray/20 rounded-lg">
                <p className="text-netflix-white font-medium mb-1">Admin</p>
                <p className="text-netflix-text-gray">admin@netflex.com</p>
                <p className="text-netflix-text-gray">admin123</p>
              </div>
              <div className="text-center p-3 bg-netflix-gray/20 rounded-lg">
                <p className="text-netflix-white font-medium mb-1">Demo User</p>
                <p className="text-netflix-text-gray">demo@netflex.com</p>
                <p className="text-netflix-text-gray">demo123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 