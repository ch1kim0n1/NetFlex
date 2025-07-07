import { loadDatabase, saveDatabase } from './databaseUtils';

// Ratings Management
export const getRatingsForContent = async (contentId, contentType) => {
  try {
    const database = await loadDatabase('ratings');
    return database.ratings.filter(rating => 
      rating.contentId === contentId && rating.contentType === contentType
    );
  } catch (error) {
    console.error('Error loading ratings:', error);
    return [];
  }
};

export const getUserRating = async (userId, profileId, contentId, contentType) => {
  try {
    const database = await loadDatabase('ratings');
    return database.ratings.find(rating => 
      rating.userId === userId && 
      rating.profileId === profileId &&
      rating.contentId === contentId && 
      rating.contentType === contentType
    );
  } catch (error) {
    console.error('Error loading user rating:', error);
    return null;
  }
};

export const saveRating = async (userId, profileId, contentId, contentType, rating) => {
  try {
    const database = await loadDatabase('ratings');
    const existingRating = database.ratings.find(r => 
      r.userId === userId && 
      r.profileId === profileId &&
      r.contentId === contentId && 
      r.contentType === contentType
    );

    if (existingRating) {
      // Update existing rating
      const updatedDatabase = {
        ...database,
        ratings: database.ratings.map(r =>
          r.id === existingRating.id 
            ? { ...r, rating, updatedAt: new Date().toISOString() }
            : r
        )
      };
      await saveDatabase('ratings', updatedDatabase);
      return updatedDatabase.ratings.find(r => r.id === existingRating.id);
    } else {
      // Create new rating
      const newRating = {
        id: `rating_${Date.now()}`,
        userId,
        profileId,
        contentId,
        contentType,
        rating,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedDatabase = {
        ...database,
        ratings: [...database.ratings, newRating]
      };
      
      await saveDatabase('ratings', updatedDatabase);
      return newRating;
    }
  } catch (error) {
    console.error('Error saving rating:', error);
    return null;
  }
};

export const getAverageRating = async (contentId, contentType) => {
  try {
    const ratings = await getRatingsForContent(contentId, contentType);
    if (ratings.length === 0) return null;
    
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return {
      average: sum / ratings.length,
      count: ratings.length
    };
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return null;
  }
};

// Reviews Management
export const getReviewsForContent = async (contentId, contentType) => {
  try {
    const database = await loadDatabase('reviews');
    return database.reviews
      .filter(review => 
        review.contentId === contentId && 
        review.contentType === contentType &&
        !review.isSpam
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
};

export const getUserReview = async (userId, profileId, contentId, contentType) => {
  try {
    const database = await loadDatabase('reviews');
    return database.reviews.find(review => 
      review.userId === userId && 
      review.profileId === profileId &&
      review.contentId === contentId && 
      review.contentType === contentType
    );
  } catch (error) {
    console.error('Error loading user review:', error);
    return null;
  }
};

export const saveReview = async (userId, profileId, contentId, contentType, title, content, rating) => {
  try {
    const database = await loadDatabase('reviews');
    const existingReview = database.reviews.find(r => 
      r.userId === userId && 
      r.profileId === profileId &&
      r.contentId === contentId && 
      r.contentType === contentType
    );

    if (existingReview) {
      // Update existing review
      const updatedDatabase = {
        ...database,
        reviews: database.reviews.map(r =>
          r.id === existingReview.id 
            ? { 
                ...r, 
                title, 
                content, 
                rating,
                updatedAt: new Date().toISOString() 
              }
            : r
        )
      };
      await saveDatabase('reviews', updatedDatabase);
      return updatedDatabase.reviews.find(r => r.id === existingReview.id);
    } else {
      // Create new review
      const newReview = {
        id: `review_${Date.now()}`,
        userId,
        profileId,
        contentId,
        contentType,
        title,
        content,
        rating,
        likes: 0,
        dislikes: 0,
        isSpam: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedDatabase = {
        ...database,
        reviews: [...database.reviews, newReview]
      };
      
      await saveDatabase('reviews', updatedDatabase);
      return newReview;
    }
  } catch (error) {
    console.error('Error saving review:', error);
    return null;
  }
};

export const likeReview = async (reviewId, isLike) => {
  try {
    const database = await loadDatabase('reviews');
    const updatedDatabase = {
      ...database,
      reviews: database.reviews.map(review =>
        review.id === reviewId 
          ? { 
              ...review, 
              likes: isLike ? review.likes + 1 : review.likes,
              dislikes: !isLike ? review.dislikes + 1 : review.dislikes
            }
          : review
      )
    };
    
    await saveDatabase('reviews', updatedDatabase);
    return updatedDatabase.reviews.find(r => r.id === reviewId);
  } catch (error) {
    console.error('Error updating review likes:', error);
    return null;
  }
};

// Invitation System
export const createInvitation = async (userId, profileId, contentId, contentType, message) => {
  try {
    const database = await loadDatabase('invitations');
    const inviteCode = `${contentType.toUpperCase()}_${contentId}_${userId}_${Date.now()}`;
    
    const newInvitation = {
      id: `invite_${Date.now()}`,
      userId,
      profileId,
      contentId,
      contentType,
      inviteCode,
      message: message || `Check out this ${contentType}!`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      maxUses: 10,
      currentUses: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    const updatedDatabase = {
      ...database,
      invitations: [...database.invitations, newInvitation]
    };
    
    await saveDatabase('invitations', updatedDatabase);
    return newInvitation;
  } catch (error) {
    console.error('Error creating invitation:', error);
    return null;
  }
};

export const getInvitation = async (inviteCode) => {
  try {
    const database = await loadDatabase('invitations');
    const invitation = database.invitations.find(invite => 
      invite.inviteCode === inviteCode && 
      invite.isActive && 
      new Date(invite.expiresAt) > new Date() &&
      invite.currentUses < invite.maxUses
    );
    return invitation;
  } catch (error) {
    console.error('Error loading invitation:', error);
    return null;
  }
};

export const useInvitation = async (inviteCode) => {
  try {
    const database = await loadDatabase('invitations');
    const updatedDatabase = {
      ...database,
      invitations: database.invitations.map(invite =>
        invite.inviteCode === inviteCode 
          ? { ...invite, currentUses: invite.currentUses + 1 }
          : invite
      )
    };
    
    await saveDatabase('invitations', updatedDatabase);
    return updatedDatabase.invitations.find(i => i.inviteCode === inviteCode);
  } catch (error) {
    console.error('Error using invitation:', error);
    return null;
  }
}; 