import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import MainLayout from '../../components/ui/MainLayout';
import ParticleBackground from '../../components/ui/ParticleBackground';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../src/contexts/AuthContext';
import { 
  getSystemStats, 
  getAllUsers, 
  getAllProfiles, 
  getAllRatings, 
  getAllReviews,
  getAllInvitations,
  toggleUserStatus,
  deleteUser,
  markReviewAsSpam,
  deleteReview,
  getSecurityOverview,
  adminClearAccountFlag,
  getAccountLoginHistory
} from '../../src/utils/adminUtils';
import { getFlaggedAccounts } from '../../src/utils/securityUtils';
import { 
  FaUsers, 
  FaStar, 
  FaComments, 
  FaShare, 
  FaChartBar, 
  FaUserShield,
  FaTrash,
  FaBan,
  FaCheck,
  FaTimes,
  FaEye,
  FaUserPlus,
  FaShieldAlt,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';

function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [flaggedAccounts, setFlaggedAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      loadAdminData();
    }
  }, [isAuthenticated, isAdmin, isLoading]);

  const loadAdminData = async () => {
    try {
      const [
        statsData, 
        usersData, 
        profilesData, 
        ratingsData, 
        reviewsData, 
        invitationsData,
        flaggedAccountsData
      ] = await Promise.all([
        getSystemStats(),
        getAllUsers(),
        getAllProfiles(),
        getAllRatings(),
        getAllReviews(),
        getAllInvitations(),
        getFlaggedAccounts()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setProfiles(profilesData);
      setRatings(ratingsData);
      setReviews(reviewsData);
      setInvitations(invitationsData);
      setFlaggedAccounts(flaggedAccountsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      loadAdminData(); // Reload data
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        loadAdminData(); // Reload data
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleMarkSpam = async (reviewId) => {
    try {
      await markReviewAsSpam(reviewId);
      loadAdminData(); // Reload data
    } catch (error) {
      console.error('Error marking review as spam:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
        loadAdminData(); // Reload data
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const handleClearFlag = async (userId, notes) => {
    try {
      await adminClearAccountFlag(userId, user.id, notes);
      loadAdminData(); // Reload data
    } catch (error) {
      console.error('Error clearing account flag:', error);
    }
  };

  if (isLoading || loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-netflix-white text-xl">Loading Admin Dashboard...</div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <Head>
        <title>Admin Dashboard - NetFlex</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <MainLayout>
        <ParticleBackground />
        <div className="px-8 py-8 relative z-10 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-8">
              <FaUserShield className="text-3xl text-netflix-red" />
              <h1 className="text-4xl font-bold text-netflix-white">Admin Dashboard</h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-netflix-gray/30">
              {[
                { id: 'overview', label: 'Overview', icon: FaChartBar },
                { id: 'users', label: 'Users', icon: FaUsers },
                { id: 'security', label: 'Security', icon: FaShieldAlt },
                { id: 'activity', label: 'Activity', icon: FaEye },
                { id: 'content', label: 'Content', icon: FaComments }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === id
                      ? 'text-netflix-red border-b-2 border-netflix-red'
                      : 'text-netflix-text-gray hover:text-netflix-white'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
              <OverviewTab stats={stats} />
            )}

            {activeTab === 'users' && (
              <UsersTab 
                users={users} 
                profiles={profiles}
                onToggleStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab 
                flaggedAccounts={flaggedAccounts}
                users={users}
                onClearFlag={handleClearFlag}
              />
            )}

            {activeTab === 'activity' && (
              <ActivityTab 
                ratings={ratings}
                reviews={reviews}
                invitations={invitations}
              />
            )}

            {activeTab === 'content' && (
              <ContentTab 
                reviews={reviews}
                onMarkSpam={handleMarkSpam}
                onDeleteReview={handleDeleteReview}
              />
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

// Overview Tab Component
const OverviewTab = ({ stats }) => {
  if (!stats) return <div className="text-netflix-white">Loading stats...</div>;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      subtitle: `${stats.users.active} active, ${stats.users.inactive} inactive`,
      icon: FaUsers,
      color: 'text-blue-400'
    },
    {
      title: 'User Profiles',
      value: stats.profiles.total,
      subtitle: 'Individual profiles',
      icon: FaUserPlus,
      color: 'text-green-400'
    },
    {
      title: 'Total Ratings',
      value: stats.content.totalRatings,
      subtitle: `Average: ${stats.content.averageRating.toFixed(1)}/5`,
      icon: FaStar,
      color: 'text-yellow-400'
    },
    {
      title: 'Total Reviews',
      value: stats.content.totalReviews,
      subtitle: 'Community feedback',
      icon: FaComments,
      color: 'text-purple-400'
    },
    {
      title: 'Security Alerts',
      value: stats.security.flaggedAccounts,
      subtitle: `${stats.security.suspiciousLogins} suspicious logins`,
      icon: FaShieldAlt,
      color: stats.security.flaggedAccounts > 0 ? 'text-red-400' : 'text-green-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <stat.icon className={`text-2xl ${stat.color}`} />
              <h3 className="text-netflix-white font-semibold">{stat.title}</h3>
            </div>
            <div className="text-3xl font-bold text-netflix-white mb-1">{stat.value}</div>
            <div className="text-netflix-text-gray text-sm">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-netflix-white mb-4">Recent Activity (Last 7 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-netflix-red">{stats.activity.recentRatings}</div>
            <div className="text-netflix-text-gray">New Ratings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-netflix-red">{stats.activity.recentReviews}</div>
            <div className="text-netflix-text-gray">New Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-netflix-red">{stats.activity.recentLogins}</div>
            <div className="text-netflix-text-gray">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-netflix-red">{stats.security.recentLogins}</div>
            <div className="text-netflix-text-gray">Total Logins</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Security Tab Component
const SecurityTab = ({ flaggedAccounts, users, onClearFlag }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [clearNotes, setClearNotes] = useState('');

  const loadLoginHistory = async (userId) => {
    try {
      const history = await getAccountLoginHistory(userId);
      setLoginHistory(history);
    } catch (error) {
      console.error('Error loading login history:', error);
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    loadLoginHistory(account.userId);
  };

  const handleClearFlag = async () => {
    if (selectedAccount && clearNotes.trim()) {
      await onClearFlag(selectedAccount.userId, clearNotes);
      setSelectedAccount(null);
      setClearNotes('');
    }
  };

  const getUserInfo = (userId) => {
    return users.find(u => u.id === userId) || { firstName: 'Unknown', lastName: 'User' };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flagged Accounts List */}
        <div className="bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg">
          <div className="p-4 border-b border-netflix-gray/30">
            <h3 className="text-xl font-bold text-netflix-white flex items-center space-x-2">
              <FaExclamationTriangle className="text-red-400" />
              <span>Flagged Accounts ({flaggedAccounts.length})</span>
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {flaggedAccounts.length === 0 ? (
              <div className="text-center py-8">
                <FaShieldAlt className="text-4xl text-green-400 mx-auto mb-2" />
                <p className="text-netflix-text-gray">No flagged accounts</p>
              </div>
            ) : (
              flaggedAccounts.map((account) => {
                const user = getUserInfo(account.userId);
                return (
                  <div
                    key={account.id}
                    onClick={() => handleAccountSelect(account)}
                    className={`p-3 border border-netflix-gray/30 rounded cursor-pointer transition-colors ${
                      selectedAccount?.id === account.id
                        ? 'bg-netflix-red/20 border-netflix-red/50'
                        : 'bg-netflix-gray/10 hover:bg-netflix-gray/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-netflix-white font-medium">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-netflix-text-gray text-sm">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 text-sm font-medium">
                          {account.incidents.length} incident{account.incidents.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-netflix-text-gray text-xs">
                          {new Date(account.flaggedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg">
          <div className="p-4 border-b border-netflix-gray/30">
            <h3 className="text-xl font-bold text-netflix-white">Account Details</h3>
          </div>
          <div className="p-4">
            {selectedAccount ? (
              <div className="space-y-4">
                {/* User Info */}
                <div>
                  <h4 className="text-netflix-white font-medium mb-2">User Information</h4>
                  <div className="bg-netflix-gray/10 rounded p-3">
                    <p className="text-netflix-white">
                      {getUserInfo(selectedAccount.userId).firstName} {getUserInfo(selectedAccount.userId).lastName}
                    </p>
                    <p className="text-netflix-text-gray text-sm">
                      {getUserInfo(selectedAccount.userId).email}
                    </p>
                  </div>
                </div>

                {/* Incidents */}
                <div>
                  <h4 className="text-netflix-white font-medium mb-2">Security Incidents</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedAccount.incidents.map((incident, index) => (
                      <div key={index} className="bg-red-500/10 border border-red-500/30 rounded p-2">
                        <p className="text-red-400 text-sm font-medium">{incident.reason}</p>
                        <p className="text-netflix-text-gray text-xs">
                          {new Date(incident.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Login History */}
                <div>
                  <h4 className="text-netflix-white font-medium mb-2">Recent Login History</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {loginHistory.slice(0, 5).map((login, index) => (
                      <div key={login.id} className="bg-netflix-gray/10 rounded p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaMapMarkerAlt className="text-netflix-text-gray text-xs" />
                            <span className={`text-sm ${login.isSuspicious ? 'text-yellow-400' : 'text-netflix-white'}`}>
                              {login.location.city}, {login.location.country}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaClock className="text-netflix-text-gray text-xs" />
                            <span className="text-netflix-text-gray text-xs">
                              {new Date(login.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {login.isSuspicious && (
                          <div className="text-yellow-400 text-xs mt-1">⚠️ Suspicious Activity</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear Flag */}
                <div>
                  <h4 className="text-netflix-white font-medium mb-2">Admin Action</h4>
                  <textarea
                    value={clearNotes}
                    onChange={(e) => setClearNotes(e.target.value)}
                    placeholder="Add notes about why this flag is being cleared..."
                    className="w-full bg-netflix-gray/30 border border-netflix-gray/50 rounded px-3 py-2 text-netflix-white text-sm h-20 resize-none focus:border-netflix-red focus:outline-none"
                  />
                  <button
                    onClick={handleClearFlag}
                    disabled={!clearNotes.trim()}
                    className="mt-2 w-full bg-green-600 hover:bg-green-700 disabled:bg-netflix-gray/50 text-white py-2 px-4 rounded transition-colors"
                  >
                    Clear Security Flag
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaUserShield className="text-4xl text-netflix-text-gray mx-auto mb-2" />
                <p className="text-netflix-text-gray">Select a flagged account to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ users, profiles, onToggleStatus, onDeleteUser }) => {
  return (
    <div className="space-y-6">
      <div className="bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-netflix-gray/30">
          <h3 className="text-xl font-bold text-netflix-white">User Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-netflix-gray/30">
              <tr>
                <th className="text-left p-4 text-netflix-white font-semibold">User</th>
                <th className="text-left p-4 text-netflix-white font-semibold">Email</th>
                <th className="text-left p-4 text-netflix-white font-semibold">Account Type</th>
                <th className="text-left p-4 text-netflix-white font-semibold">Profiles</th>
                <th className="text-left p-4 text-netflix-white font-semibold">Status</th>
                <th className="text-left p-4 text-netflix-white font-semibold">Last Login</th>
                <th className="text-left p-4 text-netflix-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const userProfiles = profiles.filter(p => p.userId === user.id && p.isActive);
                return (
                  <tr key={user.id} className="border-b border-netflix-gray/30 hover:bg-netflix-gray/10">
                    <td className="p-4">
                      <div className="text-netflix-white font-medium">
                        {user.firstName} {user.lastName}
                        {user.isAdmin && (
                          <span className="ml-2 px-2 py-1 bg-netflix-red text-white text-xs rounded">
                            ADMIN
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-netflix-text-gray">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded capitalize ${
                        user.accountType === 'premium' 
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.accountType}
                      </span>
                    </td>
                    <td className="p-4 text-netflix-text-gray">{userProfiles.length}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.isActive 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-netflix-text-gray">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {!user.isAdmin && (
                          <>
                            <button
                              onClick={() => onToggleStatus(user.id, user.isActive)}
                              className={`p-2 rounded transition-colors ${
                                user.isActive
                                  ? 'text-yellow-400 hover:bg-yellow-500/20'
                                  : 'text-green-400 hover:bg-green-500/20'
                              }`}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? <FaBan /> : <FaCheck />}
                            </button>
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                              title="Delete User"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Activity Tab Component
const ActivityTab = ({ ratings, reviews, invitations }) => {
  return (
    <div className="space-y-8">
      {/* Recent Ratings */}
      <div className="bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-netflix-white mb-4">Recent Ratings</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {ratings.slice(0, 10).map((rating) => (
            <div key={rating.id} className="flex items-center justify-between p-3 bg-netflix-gray/10 rounded">
              <div>
                <span className="text-netflix-white">Content ID: {rating.contentId}</span>
                <span className="text-netflix-text-gray ml-4">({rating.contentType})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < rating.rating ? 'text-yellow-400' : 'text-netflix-text-gray'}
                    />
                  ))}
                </div>
                <span className="text-netflix-text-gray text-sm">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-netflix-white mb-4">Recent Reviews</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="p-4 bg-netflix-gray/10 rounded">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-netflix-white font-medium">{review.title}</h4>
                <span className={`px-2 py-1 text-xs rounded ${
                  review.isSpam ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {review.isSpam ? 'SPAM' : 'ACTIVE'}
                </span>
              </div>
              <p className="text-netflix-text-gray text-sm mb-2 line-clamp-2">
                {review.content}
              </p>
              <div className="flex items-center justify-between text-xs text-netflix-text-gray">
                <span>Content ID: {review.contentId} ({review.contentType})</span>
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Invitations */}
      <div className="bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-netflix-white mb-4">Active Invitations</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {invitations.filter(inv => inv.isActive).map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between p-3 bg-netflix-gray/10 rounded">
              <div>
                <span className="text-netflix-white">Content: {invitation.contentId}</span>
                <span className="text-netflix-text-gray ml-4">({invitation.contentType})</span>
              </div>
              <div className="text-right">
                <div className="text-netflix-white text-sm">
                  {invitation.currentUses}/{invitation.maxUses} uses
                </div>
                <div className="text-netflix-text-gray text-xs">
                  Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Content Tab Component
const ContentTab = ({ reviews, onMarkSpam, onDeleteReview }) => {
  return (
    <div className="space-y-6">
      <div className="bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg">
        <div className="p-4 border-b border-netflix-gray/30">
          <h3 className="text-xl font-bold text-netflix-white">Review Moderation</h3>
        </div>
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 bg-netflix-gray/10 rounded border-l-4 border-l-netflix-red">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-netflix-white font-medium">{review.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < review.rating ? 'text-yellow-400' : 'text-netflix-text-gray'}
                          size={12}
                        />
                      ))}
                    </div>
                    <span className="text-netflix-text-gray text-xs">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    review.isSpam ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {review.isSpam ? 'SPAM' : 'ACTIVE'}
                  </span>
                  {!review.isSpam && (
                    <button
                      onClick={() => onMarkSpam(review.id)}
                      className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                      title="Mark as Spam"
                    >
                      <FaBan size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteReview(review.id)}
                    className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete Review"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              <p className="text-netflix-text-gray text-sm mb-2">{review.content}</p>
              <div className="flex items-center justify-between text-xs text-netflix-text-gray">
                <span>Content: {review.contentId} ({review.contentType})</span>
                <span>👍 {review.likes} | 👎 {review.dislikes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 