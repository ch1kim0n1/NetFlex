import { loadDatabase, saveDatabase } from './databaseUtils';
import { getFlaggedAccounts, clearAccountFlag, getUserLoginHistory } from './securityUtils';

// User Management
export const getAllUsers = async () => {
  try {
    const database = await loadDatabase('users');
    return database.users.map(user => {
      // Don't return passwords in admin view
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const getAllProfiles = async () => {
  try {
    const database = await loadDatabase('profiles');
    return database.profiles;
  } catch (error) {
    console.error('Error loading profiles:', error);
    return [];
  }
};

export const toggleUserStatus = async (userId, isActive) => {
  try {
    const database = await loadDatabase('users');
    const updatedDatabase = {
      ...database,
      users: database.users.map(user =>
        user.id === userId 
          ? { ...user, isActive, updatedAt: new Date().toISOString() }
          : user
      )
    };
    
    await saveDatabase('users', updatedDatabase);
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    return false;
  }
};

export const deleteUser = async (userId) => {
  try {
    const database = await loadDatabase('users');
    const updatedDatabase = {
      ...database,
      users: database.users.map(user =>
        user.id === userId 
          ? { ...user, isActive: false, deletedAt: new Date().toISOString() }
          : user
      )
    };
    
    await saveDatabase('users', updatedDatabase);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

// Activity Monitoring
export const getAllRatings = async () => {
  try {
    const database = await loadDatabase('ratings');
    return database.ratings;
  } catch (error) {
    console.error('Error loading ratings:', error);
    return [];
  }
};

export const getAllReviews = async () => {
  try {
    const database = await loadDatabase('reviews');
    return database.reviews;
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
};

export const getAllInvitations = async () => {
  try {
    const database = await loadDatabase('invitations');
    return database.invitations;
  } catch (error) {
    console.error('Error loading invitations:', error);
    return [];
  }
};

export const markReviewAsSpam = async (reviewId) => {
  try {
    const database = await loadDatabase('reviews');
    const updatedDatabase = {
      ...database,
      reviews: database.reviews.map(review =>
        review.id === reviewId 
          ? { ...review, isSpam: true, moderatedAt: new Date().toISOString() }
          : review
      )
    };
    
    await saveDatabase('reviews', updatedDatabase);
    return true;
  } catch (error) {
    console.error('Error marking review as spam:', error);
    return false;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const database = await loadDatabase('reviews');
    const updatedDatabase = {
      ...database,
      reviews: database.reviews.filter(review => review.id !== reviewId)
    };
    
    await saveDatabase('reviews', updatedDatabase);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
};

// Security Management
export const getSecurityOverview = async () => {
  try {
    const flaggedAccounts = await getFlaggedAccounts();
    const securityDatabase = await loadDatabase('security');
    
    const recentLogins = securityDatabase.loginHistory
      .filter(login => {
        const loginDate = new Date(login.timestamp);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return loginDate > dayAgo;
      }).length;

    const suspiciousLogins = securityDatabase.loginHistory
      .filter(login => login.isSuspicious).length;

    return {
      flaggedAccounts: flaggedAccounts.length,
      recentLogins,
      suspiciousLogins,
      totalLoginRecords: securityDatabase.loginHistory.length
    };
  } catch (error) {
    console.error('Error getting security overview:', error);
    return {
      flaggedAccounts: 0,
      recentLogins: 0,
      suspiciousLogins: 0,
      totalLoginRecords: 0
    };
  }
};

export const adminClearAccountFlag = async (userId, adminId, notes = '') => {
  try {
    return await clearAccountFlag(userId, adminId, notes);
  } catch (error) {
    console.error('Error clearing account flag:', error);
    return false;
  }
};

export const getAccountLoginHistory = async (userId, limit = 20) => {
  try {
    return await getUserLoginHistory(userId, limit);
  } catch (error) {
    console.error('Error getting account login history:', error);
    return [];
  }
};

// Analytics
export const getSystemStats = async () => {
  try {
    const [users, profiles, ratings, reviews, invitations, securityOverview] = await Promise.all([
      getAllUsers(),
      getAllProfiles(),
      getAllRatings(),
      getAllReviews(),
      getAllInvitations(),
      getSecurityOverview()
    ]);

    const activeUsers = users.filter(user => user.isActive).length;
    const totalProfiles = profiles.filter(profile => profile.isActive).length;
    const totalRatings = ratings.length;
    const totalReviews = reviews.filter(review => !review.isSpam).length;
    const totalInvitations = invitations.filter(invite => invite.isActive).length;

    // Calculate average rating
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRatings = ratings.filter(rating => 
      new Date(rating.createdAt) > sevenDaysAgo
    ).length;
    const recentReviews = reviews.filter(review => 
      new Date(review.createdAt) > sevenDaysAgo && !review.isSpam
    ).length;

    return {
      users: {
        total: users.length,
        active: activeUsers,
        inactive: users.length - activeUsers
      },
      profiles: {
        total: totalProfiles
      },
      content: {
        totalRatings,
        totalReviews,
        averageRating: avgRating,
        totalInvitations
      },
      activity: {
        recentRatings,
        recentReviews,
        recentLogins: users.filter(user => 
          new Date(user.lastLogin) > sevenDaysAgo
        ).length
      },
      security: securityOverview
    };
  } catch (error) {
    console.error('Error calculating system stats:', error);
    return null;
  }
}; 