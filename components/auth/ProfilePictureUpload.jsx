import { useState, useRef } from 'react';
import { FaCamera, FaUser, FaUpload, FaTimes } from 'react-icons/fa';

const ProfilePictureUpload = ({ currentAvatar, onAvatarChange, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert file to base64 for local storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        onAvatarChange(base64String);
        onClose();
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDefaultAvatar = () => {
    // Generate a random avatar from the dicebear API
    const seed = Math.random().toString(36).substring(7);
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    onAvatarChange(defaultAvatar);
    onClose();
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(currentAvatar);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-netflix-gray border border-netflix-gray/30 rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-netflix-white">Update Profile Picture</h3>
          <button
            onClick={onClose}
            className="text-netflix-text-gray hover:text-netflix-white transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-netflix-red"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-netflix-red hover:bg-netflix-red/80 text-white p-2 rounded-full transition-colors"
            >
              <FaCamera size={16} />
            </button>
          </div>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Selected File Info */}
        {selectedFile && (
          <div className="bg-netflix-gray/20 border border-netflix-gray/30 rounded p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaUpload className="text-netflix-red" />
                <span className="text-netflix-white text-sm">{selectedFile.name}</span>
              </div>
              <button
                onClick={handleRemove}
                className="text-netflix-text-gray hover:text-red-400 transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>
            <div className="text-netflix-text-gray text-xs mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Upload Custom Picture */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 bg-netflix-red hover:bg-netflix-red/80 text-netflix-white py-3 px-4 rounded transition-colors"
          >
            <FaUpload />
            <span>Choose Picture</span>
          </button>

          {/* Save Changes */}
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-4 rounded transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Save Changes'}
            </button>
          )}

          {/* Generate Random Avatar */}
          <button
            onClick={handleDefaultAvatar}
            className="w-full flex items-center justify-center space-x-2 bg-netflix-gray/30 hover:bg-netflix-gray/50 text-netflix-white py-3 px-4 rounded transition-colors"
          >
            <FaUser />
            <span>Generate Random Avatar</span>
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full bg-transparent border border-netflix-gray/30 hover:border-netflix-gray text-netflix-text-gray hover:text-netflix-white py-3 px-4 rounded transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Upload Guidelines */}
        <div className="mt-4 text-xs text-netflix-text-gray">
          <p className="mb-1">• Supported formats: JPG, PNG, GIF</p>
          <p className="mb-1">• Maximum file size: 5MB</p>
          <p>• Recommended: Square images (1:1 ratio)</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload; 