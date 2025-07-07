import { loadDatabase, saveDatabase } from './databaseUtils';

// Get approximate location from IP (mock implementation for demo)
export const getLocationFromIP = async (ip = null) => {
  // In a real implementation, you'd use a service like ipapi.co or ipgeolocation.io
  // For demo purposes, we'll simulate different locations
  const mockLocations = [
    { city: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
    { city: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437 },
    { city: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
    { city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
    { city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 }
  ];

  // Return a random location for demo (in real app, would be based on actual IP)
  return mockLocations[Math.floor(Math.random() * mockLocations.length)];
};

// Calculate distance between two geographic points
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Record a login attempt
export const recordLogin = async (userId, userAgent = '', ip = null) => {
  try {
    const location = await getLocationFromIP(ip);
    const database = await loadDatabase('security');
    
    const loginRecord = {
      id: `login_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      timestamp: new Date().toISOString(),
      location,
      userAgent,
      ip: ip || 'unknown',
      isSuspicious: false
    };

    // Add to login history
    database.loginHistory.push(loginRecord);

    // Keep only last 100 login records per user to prevent excessive storage
    const userLogins = database.loginHistory.filter(login => login.userId === userId);
    if (userLogins.length > 100) {
      database.loginHistory = database.loginHistory.filter(login => 
        login.userId !== userId || userLogins.slice(-100).includes(login)
      );
    }

    await saveDatabase('security', database);
    
    // Check for suspicious activity
    await checkSuspiciousActivity(userId);
    
    return loginRecord;
  } catch (error) {
    console.error('Error recording login:', error);
    return null;
  }
};

// Check for suspicious login activity
export const checkSuspiciousActivity = async (userId) => {
  try {
    const database = await loadDatabase('security');
    const settings = database.securitySettings;
    
    // Get recent logins for this user (within time window)
    const timeWindow = new Date(Date.now() - settings.timeWindowHours * 60 * 60 * 1000);
    const recentLogins = database.loginHistory
      .filter(login => 
        login.userId === userId && 
        new Date(login.timestamp) > timeWindow
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (recentLogins.length < 2) {
      return false; // Not enough data to determine suspicious activity
    }

    let suspiciousCount = 0;
    const flaggedLogins = [];

    // Check each login against the previous one
    for (let i = 0; i < recentLogins.length - 1; i++) {
      const currentLogin = recentLogins[i];
      const previousLogin = recentLogins[i + 1];
      
      const distance = calculateDistance(
        currentLogin.location.lat,
        currentLogin.location.lon,
        previousLogin.location.lat,
        previousLogin.location.lon
      );

      const timeDiff = (new Date(currentLogin.timestamp) - new Date(previousLogin.timestamp)) / (1000 * 60 * 60); // hours

      // If distance is greater than max allowed and time difference is small, flag as suspicious
      if (distance > settings.maxLocationDistance && timeDiff < 6) {
        suspiciousCount++;
        currentLogin.isSuspicious = true;
        flaggedLogins.push({
          loginId: currentLogin.id,
          distance,
          timeDiff,
          reason: 'Impossible travel distance'
        });
      }
    }

    // If too many suspicious logins, flag the account
    if (suspiciousCount >= settings.maxSuspiciousLogins) {
      await flagAccount(userId, 'Multiple suspicious logins detected', flaggedLogins);
      return true;
    }

    // Update the database with suspicious login flags
    await saveDatabase('security', database);
    return suspiciousCount > 0;
  } catch (error) {
    console.error('Error checking suspicious activity:', error);
    return false;
  }
};

// Flag an account for suspicious activity
export const flagAccount = async (userId, reason, evidence = []) => {
  try {
    const database = await loadDatabase('security');
    
    // Check if account is already flagged
    const existingFlag = database.flaggedAccounts.find(flag => flag.userId === userId && flag.isActive);
    
    if (existingFlag) {
      // Update existing flag
      existingFlag.incidents.push({
        timestamp: new Date().toISOString(),
        reason,
        evidence
      });
      existingFlag.lastIncident = new Date().toISOString();
    } else {
      // Create new flag
      const accountFlag = {
        id: `flag_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId,
        isActive: true,
        flaggedAt: new Date().toISOString(),
        lastIncident: new Date().toISOString(),
        incidents: [{
          timestamp: new Date().toISOString(),
          reason,
          evidence
        }],
        adminReviewed: false,
        reviewedBy: null,
        reviewedAt: null
      };
      
      database.flaggedAccounts.push(accountFlag);
    }

    await saveDatabase('security', database);
    
    // In a real app, you might send notifications to admins here
    console.warn(`Account ${userId} flagged for: ${reason}`);
    
    return true;
  } catch (error) {
    console.error('Error flagging account:', error);
    return false;
  }
};

// Get flagged accounts (for admin dashboard)
export const getFlaggedAccounts = async () => {
  try {
    const database = await loadDatabase('security');
    return database.flaggedAccounts.filter(flag => flag.isActive);
  } catch (error) {
    console.error('Error getting flagged accounts:', error);
    return [];
  }
};

// Clear account flag (admin action)
export const clearAccountFlag = async (userId, adminId, notes = '') => {
  try {
    const database = await loadDatabase('security');
    
    const flagIndex = database.flaggedAccounts.findIndex(
      flag => flag.userId === userId && flag.isActive
    );
    
    if (flagIndex !== -1) {
      database.flaggedAccounts[flagIndex].isActive = false;
      database.flaggedAccounts[flagIndex].adminReviewed = true;
      database.flaggedAccounts[flagIndex].reviewedBy = adminId;
      database.flaggedAccounts[flagIndex].reviewedAt = new Date().toISOString();
      database.flaggedAccounts[flagIndex].reviewNotes = notes;
      
      await saveDatabase('security', database);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error clearing account flag:', error);
    return false;
  }
};

// Get user's login history
export const getUserLoginHistory = async (userId, limit = 10) => {
  try {
    const database = await loadDatabase('security');
    return database.loginHistory
      .filter(login => login.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting user login history:', error);
    return [];
  }
};

// Check if account is currently flagged
export const isAccountFlagged = async (userId) => {
  try {
    const database = await loadDatabase('security');
    return database.flaggedAccounts.some(flag => flag.userId === userId && flag.isActive);
  } catch (error) {
    console.error('Error checking account flag status:', error);
    return false;
  }
}; 