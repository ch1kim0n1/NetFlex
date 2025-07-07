import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../src/contexts/AuthContext';
import { getUserLoginHistory } from '../../src/utils/securityUtils';

const SecurityAlert = () => {
  const { user, isFlagged } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isFlagged && user && !dismissed) {
      setShowAlert(true);
      loadLoginHistory();
    }
  }, [isFlagged, user, dismissed]);

  const loadLoginHistory = async () => {
    if (user) {
      try {
        const history = await getUserLoginHistory(user.id, 5);
        setLoginHistory(history);
      } catch (error) {
        console.error('Error loading login history:', error);
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowAlert(false);
  };

  if (!showAlert || !isFlagged) return null;

  return (
    <div className="fixed top-20 right-4 max-w-md bg-red-900/90 border border-red-500/50 rounded-lg p-4 shadow-2xl z-50 backdrop-blur-sm">
      <div className="flex items-start space-x-3">
        <FaExclamationTriangle className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-red-400 font-semibold">Security Alert</h3>
            <button
              onClick={handleDismiss}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>
          
          <p className="text-red-300 text-sm mb-3">
            Your account has been flagged for suspicious activity. This may be due to logins from multiple locations in a short time period.
          </p>

          <div className="space-y-2 mb-3">
            <div className="flex items-center space-x-2">
              <FaShieldAlt className="text-red-400 text-sm" />
              <span className="text-red-300 text-xs font-medium">Account Status: Under Review</span>
            </div>
            
            {loginHistory.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <FaMapMarkerAlt className="text-red-400 text-sm" />
                  <span className="text-red-300 text-xs font-medium">Recent Login Locations:</span>
                </div>
                <div className="space-y-1 ml-5">
                  {loginHistory.slice(0, 3).map((login, index) => (
                    <div key={login.id} className="text-xs text-red-200">
                      <span className={login.isSuspicious ? 'text-yellow-400 font-medium' : ''}>
                        {login.location.city}, {login.location.country}
                      </span>
                      <span className="text-red-400 ml-2">
                        {new Date(login.timestamp).toLocaleDateString()}
                      </span>
                      {login.isSuspicious && (
                        <span className="text-yellow-400 ml-2 text-xs">⚠️ Suspicious</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-red-200 space-y-1">
            <p><strong>What this means:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>Your account access may be limited</li>
              <li>Additional verification may be required</li>
              <li>An admin will review your account</li>
            </ul>
          </div>

          <div className="mt-3 text-xs text-red-300">
            <p>
              <strong>Contact:</strong> If this is a mistake, contact support at{' '}
              <span className="text-red-400 font-medium">admin@netflex.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlert; 