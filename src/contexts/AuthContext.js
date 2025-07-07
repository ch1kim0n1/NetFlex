import { createContext, useContext, useState, useEffect } from 'react';
import { authenticateUser, getProfilesForUser } from '../utils/authUtils';
import { recordLogin, isAccountFlagged } from '../utils/securityUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlagged, setIsFlagged] = useState(false);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('netflex_user');
    const storedProfile = localStorage.getItem('netflex_current_profile');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.isAdmin || false);
      
      // Check if account is flagged
      checkAccountFlag(userData.id);
      
      // Load user profiles
      getProfilesForUser(userData.id).then(userProfiles => {
        setProfiles(userProfiles);
        
        // Set current profile if stored
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          const validProfile = userProfiles.find(p => p.id === profileData.id);
          if (validProfile) {
            setCurrentProfile(validProfile);
          }
        }
      });
    }
    setIsLoading(false);
  }, []);

  const checkAccountFlag = async (userId) => {
    try {
      const flagged = await isAccountFlagged(userId);
      setIsFlagged(flagged);
    } catch (error) {
      console.error('Error checking account flag:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const userData = await authenticateUser(email, password);
      if (userData) {
        // Record login for security tracking
        const userAgent = navigator.userAgent;
        await recordLogin(userData.id, userAgent);
        
        // Check if account is flagged
        const flagged = await isAccountFlagged(userData.id);
        setIsFlagged(flagged);
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.isAdmin || false);
        localStorage.setItem('netflex_user', JSON.stringify(userData));
        
        // Load user profiles
        const userProfiles = await getProfilesForUser(userData.id);
        setProfiles(userProfiles);
        
        return { 
          success: true, 
          user: userData, 
          profiles: userProfiles,
          isFlagged: flagged
        };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentProfile(null);
    setProfiles([]);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsFlagged(false);
    localStorage.removeItem('netflex_user');
    localStorage.removeItem('netflex_current_profile');
  };

  const selectProfile = (profile) => {
    setCurrentProfile(profile);
    localStorage.setItem('netflex_current_profile', JSON.stringify(profile));
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      return false;
    }
    return true;
  };

  const requireAdmin = () => {
    if (!isAuthenticated || !isAdmin) {
      return false;
    }
    return true;
  };

  const value = {
    user,
    currentProfile,
    profiles,
    isAuthenticated,
    isAdmin,
    isLoading,
    isFlagged,
    login,
    logout,
    selectProfile,
    setProfiles,
    requireAuth,
    requireAdmin,
    checkAccountFlag
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 