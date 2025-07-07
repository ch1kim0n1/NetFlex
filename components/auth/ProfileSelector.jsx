import { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaTrash, FaCamera } from 'react-icons/fa';
import { useAuth } from '../../src/contexts/AuthContext';
import { getProfilesForUser, createProfile, updateProfile, deleteProfile } from '../../src/utils/authUtils';
import ProfilePictureUpload from './ProfilePictureUpload';

const ProfileSelector = ({ isOpen, onClose, onProfileSelect }) => {
  const { user, profiles, setProfiles } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showPictureUpload, setShowPictureUpload] = useState(false);
  const [uploadingProfileId, setUploadingProfileId] = useState(null);
  const [newProfile, setNewProfile] = useState({
    name: '',
    avatar: '',
    preferences: {
      language: 'en',
      autoplay: true,
      maturityRating: 'PG-13'
    }
  });

  useEffect(() => {
    if (isOpen && user) {
      loadProfiles();
    }
  }, [isOpen, user]);

  const loadProfiles = async () => {
    try {
      const userProfiles = await getProfilesForUser(user.id);
      setProfiles(userProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const handleProfileSelect = (profile) => {
    onProfileSelect(profile);
    onClose();
  };

  const handleCreateProfile = async () => {
    if (!newProfile.name.trim()) return;

    try {
      const profileData = {
        ...newProfile,
        userId: user.id,
        avatar: newProfile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newProfile.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
      };
      
      await createProfile(profileData);
      await loadProfiles();
      setIsCreating(false);
      setNewProfile({
        name: '',
        avatar: '',
        preferences: { language: 'en', autoplay: true, maturityRating: 'PG-13' }
      });
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!newProfile.name.trim() || !editingProfile) return;

    try {
      await updateProfile(editingProfile.id, newProfile);
      await loadProfiles();
      setEditingProfile(null);
      setNewProfile({
        name: '',
        avatar: '',
        preferences: { language: 'en', autoplay: true, maturityRating: 'PG-13' }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteProfile(profileId);
        await loadProfiles();
        setEditingProfile(null);
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  const handleAvatarUpdate = async (profileId, newAvatar) => {
    try {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        const updatedProfile = { ...profile, avatar: newAvatar };
        await updateProfile(profileId, updatedProfile);
        await loadProfiles();
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const handleProfilePictureClick = (profileId) => {
    setUploadingProfileId(profileId);
    setShowPictureUpload(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-netflix-gray border border-netflix-gray/30 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-netflix-gray/30">
            <h2 className="text-2xl font-bold text-netflix-white">
              {isCreating || editingProfile ? (isCreating ? 'Create Profile' : 'Edit Profile') : 'Profile Selection'}
            </h2>
            <button
              onClick={onClose}
              className="text-netflix-text-gray hover:text-netflix-white transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="p-6">
            {!isCreating && !editingProfile ? (
              <>
                {/* Profile Selection */}
                <div className="text-center mb-8">
                  <p className="text-netflix-text-gray">
                    Each account has one primary profile. You can customize your profile name, picture, and preferences.
                  </p>
                </div>

                <div className="flex justify-center mb-8">
                  {profiles.length > 0 ? (
                    <div className="flex flex-col items-center space-y-4 group cursor-pointer">
                      <div className="relative">
                        <img
                          src={profiles[0].avatar}
                          alt={profiles[0].name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-transparent group-hover:border-netflix-red transition-all duration-300"
                          onClick={() => handleProfileSelect(profiles[0])}
                        />
                        {/* Camera Icon for Picture Upload */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProfilePictureClick(profiles[0].id);
                          }}
                          className="absolute bottom-2 right-2 bg-netflix-red hover:bg-netflix-red/80 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FaCamera size={16} />
                        </button>
                      </div>
                      <div className="text-center">
                        <h3 className="text-netflix-white font-medium text-xl">{profiles[0].name}</h3>
                        <p className="text-netflix-text-gray text-sm">Primary Profile</p>
                      </div>
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProfile(profiles[0]);
                          setNewProfile({
                            name: profiles[0].name,
                            avatar: profiles[0].avatar,
                            preferences: profiles[0].preferences
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-netflix-gray/50 hover:bg-netflix-gray/70 text-netflix-white px-4 py-2 rounded transition-all flex items-center space-x-2"
                      >
                        <FaEdit size={14} />
                        <span>Edit Profile</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-32 h-32 rounded-full border-4 border-dashed border-netflix-gray/50 flex items-center justify-center mb-4 mx-auto">
                        <span className="text-netflix-text-gray text-sm">No Profile</span>
                      </div>
                      <p className="text-netflix-text-gray mb-4">You need to create a profile to continue.</p>
                      <button
                        onClick={() => setIsCreating(true)}
                        className="bg-netflix-red hover:bg-netflix-red/80 text-netflix-white px-6 py-3 rounded font-medium transition-colors"
                      >
                        Create Profile
                      </button>
                    </div>
                  )}
                </div>

                {profiles.length > 0 && (
                  <div className="text-center">
                    <button
                      onClick={() => handleProfileSelect(profiles[0])}
                      className="bg-netflix-red hover:bg-netflix-red/80 text-netflix-white px-8 py-3 rounded font-medium transition-colors"
                    >
                      Continue with {profiles[0].name}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Profile Creation/Edit Form */}
                <div className="max-w-md mx-auto">
                  {/* Avatar Selection */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                      <img
                        src={newProfile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newProfile.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                        alt="Profile Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-netflix-red"
                      />
                      <button
                        onClick={() => {
                          setUploadingProfileId('new');
                          setShowPictureUpload(true);
                        }}
                        className="absolute bottom-0 right-0 bg-netflix-red hover:bg-netflix-red/80 text-white p-2 rounded-full transition-colors"
                      >
                        <FaCamera size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const seed = Math.random().toString(36).substring(7);
                        setNewProfile(prev => ({
                          ...prev,
                          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
                        }));
                      }}
                      className="text-sm text-netflix-red hover:text-netflix-red/80 transition-colors"
                    >
                      Generate Random Avatar
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-netflix-white font-medium mb-2">Profile Name</label>
                      <input
                        type="text"
                        value={newProfile.name}
                        onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-netflix-gray/30 border border-netflix-gray/50 rounded px-4 py-3 text-netflix-white focus:border-netflix-red focus:outline-none"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-netflix-white font-medium mb-2">Maturity Rating</label>
                      <select
                        value={newProfile.preferences.maturityRating}
                        onChange={(e) => setNewProfile(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, maturityRating: e.target.value }
                        }))}
                        className="w-full bg-netflix-gray/30 border border-netflix-gray/50 rounded px-4 py-3 text-netflix-white focus:border-netflix-red focus:outline-none"
                      >
                        <option value="G">G - All Ages</option>
                        <option value="PG">PG - Parental Guidance</option>
                        <option value="PG-13">PG-13 - Teens 13+</option>
                        <option value="R">R - Restricted</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-netflix-white font-medium mb-2">Language</label>
                      <select
                        value={newProfile.preferences.language}
                        onChange={(e) => setNewProfile(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, language: e.target.value }
                        }))}
                        className="w-full bg-netflix-gray/30 border border-netflix-gray/50 rounded px-4 py-3 text-netflix-white focus:border-netflix-red focus:outline-none"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoplay"
                        checked={newProfile.preferences.autoplay}
                        onChange={(e) => setNewProfile(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, autoplay: e.target.checked }
                        }))}
                        className="w-4 h-4 text-netflix-red bg-netflix-gray border-netflix-gray rounded focus:ring-netflix-red"
                      />
                      <label htmlFor="autoplay" className="text-netflix-white">
                        Autoplay next episode
                      </label>
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={editingProfile ? handleUpdateProfile : handleCreateProfile}
                      disabled={!newProfile.name.trim()}
                      className="flex-1 bg-netflix-red hover:bg-netflix-red/80 disabled:bg-netflix-gray/50 text-netflix-white py-3 px-6 rounded font-medium transition-colors"
                    >
                      {editingProfile ? 'Update Profile' : 'Create Profile'}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setEditingProfile(null);
                        setNewProfile({
                          name: '',
                          avatar: '',
                          preferences: { language: 'en', autoplay: true, maturityRating: 'PG-13' }
                        });
                      }}
                      className="flex-1 bg-transparent border border-netflix-gray/50 text-netflix-text-gray hover:text-netflix-white py-3 px-6 rounded font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Delete Button for Editing */}
                  {editingProfile && (
                    <button
                      onClick={() => handleDeleteProfile(editingProfile.id)}
                      className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaTrash />
                      <span>Delete Profile</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      {showPictureUpload && (
        <ProfilePictureUpload
          currentAvatar={
            uploadingProfileId === 'new' 
              ? newProfile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newProfile.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
              : profiles.find(p => p.id === uploadingProfileId)?.avatar || ''
          }
          onAvatarChange={(newAvatar) => {
            if (uploadingProfileId === 'new') {
              setNewProfile(prev => ({ ...prev, avatar: newAvatar }));
            } else {
              handleAvatarUpdate(uploadingProfileId, newAvatar);
            }
            setShowPictureUpload(false);
            setUploadingProfileId(null);
          }}
          onClose={() => {
            setShowPictureUpload(false);
            setUploadingProfileId(null);
          }}
        />
      )}
    </>
  );
};

export default ProfileSelector; 