import { useState, useEffect } from 'react';
import { FaStar, FaThumbsUp, FaThumbsDown, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import { useAuth } from '../../src/contexts/AuthContext';
import { 
  getReviewsForContent, 
  createReview, 
  updateReview, 
  deleteReview, 
  likeReview, 
  dislikeReview 
} from '../../src/utils/socialUtils';
import { getAllUsers, getAllProfiles } from '../../src/utils/adminUtils';

const ReviewsSection = ({ contentId, contentType }) => {
  const { user, currentProfile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5
  });

  useEffect(() => {
    loadReviews();
    loadUserData();
  }, [contentId, contentType]);

  const loadUserData = async () => {
    try {
      const [usersData, profilesData] = await Promise.all([
        getAllUsers(),
        getAllProfiles()
      ]);
      setUsers(usersData);
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviewsData = await getReviewsForContent(contentId, contentType);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return { name: 'Unknown User', avatar: null };
    
    const userAccount = users.find(u => u.id === profile.userId);
    return {
      name: profile.name,
      avatar: profile.avatar,
      accountType: userAccount?.accountType || 'standard'
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !currentProfile) return;

    try {
      const reviewData = {
        ...formData,
        contentId,
        contentType,
        profileId: currentProfile.id
      };

      if (editingReview) {
        await updateReview(editingReview.id, reviewData);
      } else {
        await createReview(reviewData);
      }

      await loadReviews();
      resetForm();
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      title: review.title,
      content: review.content,
      rating: review.rating
    });
    setShowForm(true);
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
        await loadReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const handleLike = async (reviewId) => {
    if (!user || !currentProfile) return;
    try {
      await likeReview(reviewId, currentProfile.id);
      await loadReviews();
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleDislike = async (reviewId) => {
    if (!user || !currentProfile) return;
    try {
      await dislikeReview(reviewId, currentProfile.id);
      await loadReviews();
    } catch (error) {
      console.error('Error disliking review:', error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', rating: 5 });
    setShowForm(false);
    setEditingReview(null);
  };

  const canEditReview = (review) => {
    return currentProfile && review.profileId === currentProfile.id;
  };

  const hasUserReviewed = () => {
    return currentProfile && reviews.some(review => review.profileId === currentProfile.id);
  };

  return (
    <div className="bg-netflix-gray/20 border border-netflix-gray/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-netflix-white">Community Reviews</h3>
        <span className="text-netflix-text-gray text-sm">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Write Review Button */}
      {user && currentProfile && !hasUserReviewed() && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-netflix-red hover:bg-netflix-red/80 text-netflix-white px-4 py-2 rounded transition-colors"
          >
            Write a Review
          </button>
        </div>
      )}

      {/* Review Form */}
      {showForm && user && currentProfile && (
        <div className="mb-6 p-4 bg-netflix-gray/30 border border-netflix-gray/50 rounded-lg">
          <h4 className="text-netflix-white font-medium mb-4">
            {editingReview ? 'Edit Review' : 'Write Your Review'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-netflix-white text-sm font-medium mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-netflix-gray/30 border border-netflix-gray/50 rounded px-3 py-2 text-netflix-white focus:border-netflix-red focus:outline-none"
                placeholder="Give your review a title..."
                required
              />
            </div>

            <div>
              <label className="block text-netflix-white text-sm font-medium mb-2">
                Your Review
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full bg-netflix-gray/30 border border-netflix-gray/50 rounded px-3 py-2 text-netflix-white focus:border-netflix-red focus:outline-none h-24 resize-none"
                placeholder="Share your thoughts about this content..."
                required
              />
            </div>

            <div>
              <label className="block text-netflix-white text-sm font-medium mb-2">
                Rating
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className={`text-2xl transition-colors ${
                      star <= formData.rating ? 'text-yellow-400' : 'text-netflix-text-gray'
                    }`}
                  >
                    <FaStar />
                  </button>
                ))}
                <span className="ml-2 text-netflix-white text-sm">
                  {formData.rating}/5 stars
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-netflix-red hover:bg-netflix-red/80 text-netflix-white px-4 py-2 rounded transition-colors"
              >
                {editingReview ? 'Update Review' : 'Post Review'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-transparent border border-netflix-gray/50 text-netflix-text-gray hover:text-netflix-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-netflix-text-gray">Loading reviews...</div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-netflix-text-gray mb-2">No reviews yet</div>
          <div className="text-netflix-text-gray text-sm">
            Be the first to share your thoughts about this content!
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const userInfo = getUserInfo(review.profileId);
            const isOwnReview = canEditReview(review);
            
            return (
              <div key={review.id} className="p-4 bg-netflix-gray/10 border border-netflix-gray/30 rounded-lg">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {userInfo.avatar ? (
                        <img
                          src={userInfo.avatar}
                          alt={userInfo.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-netflix-gray/50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-netflix-gray/50 flex items-center justify-center border-2 border-netflix-gray/50">
                          <FaUser className="text-netflix-text-gray" />
                        </div>
                      )}
                    </div>
                    
                    {/* User Info and Rating */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-netflix-white font-medium">{userInfo.name}</span>
                        {userInfo.accountType === 'premium' && (
                          <span className="text-xs bg-netflix-red text-white px-2 py-0.5 rounded">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`text-sm ${
                                star <= review.rating ? 'text-yellow-400' : 'text-netflix-text-gray'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-netflix-text-gray text-xs">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isOwnReview && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-netflix-text-gray hover:text-netflix-white transition-colors p-1"
                        title="Edit Review"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-netflix-text-gray hover:text-red-400 transition-colors p-1"
                        title="Delete Review"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="mb-3">
                  <h4 className="text-netflix-white font-medium mb-2">{review.title}</h4>
                  <p className="text-netflix-text-gray text-sm leading-relaxed">
                    {review.content}
                  </p>
                </div>

                {/* Like/Dislike Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(review.id)}
                    disabled={!user || !currentProfile}
                    className={`flex items-center space-x-1 text-sm transition-colors ${
                      !user || !currentProfile 
                        ? 'text-netflix-text-gray cursor-not-allowed' 
                        : 'text-netflix-text-gray hover:text-green-400'
                    }`}
                  >
                    <FaThumbsUp />
                    <span>{review.likes || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDislike(review.id)}
                    disabled={!user || !currentProfile}
                    className={`flex items-center space-x-1 text-sm transition-colors ${
                      !user || !currentProfile 
                        ? 'text-netflix-text-gray cursor-not-allowed' 
                        : 'text-netflix-text-gray hover:text-red-400'
                    }`}
                  >
                    <FaThumbsDown />
                    <span>{review.dislikes || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Login Prompt */}
      {!user && (
        <div className="text-center py-4 mt-6 border-t border-netflix-gray/30">
          <p className="text-netflix-text-gray text-sm">
            <span className="text-netflix-white">Sign in</span> to write reviews and interact with the community
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection; 