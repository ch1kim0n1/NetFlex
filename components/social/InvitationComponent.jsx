import { useState } from 'react';
import { FaShare, FaCopy, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../src/contexts/AuthContext';
import { createInvitation } from '../../src/utils/socialUtils';

const InvitationComponent = ({ contentId, contentType, contentTitle }) => {
  const { user, currentProfile, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [invitationLink, setInvitationLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateInvitation = async () => {
    if (!isAuthenticated || !user || !currentProfile) return;

    setLoading(true);
    try {
      const invitation = await createInvitation(
        user.id,
        currentProfile.id,
        contentId,
        contentType,
        message || `Check out ${contentTitle}! I think you'll love it.`
      );

      if (invitation) {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/invite/${invitation.inviteCode}`;
        setInvitationLink(link);
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
    }
    setLoading(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setInvitationLink('');
    setMessage('');
    setCopied(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-3 bg-netflix-gray/20 border border-netflix-gray/30 rounded-md">
        <p className="text-netflix-text-gray text-sm">
          Sign in to share this {contentType} with friends
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-netflix-gray/30 hover:bg-netflix-gray/50 text-netflix-white rounded-md transition-colors"
      >
        <FaShare className="text-sm" />
        <span>Share</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal Content */}
          <div className="relative bg-netflix-black border border-netflix-gray/30 rounded-lg w-full max-w-md mx-4 p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-netflix-white">
                Share {contentTitle}
              </h3>
              <button
                onClick={handleClose}
                className="text-netflix-text-gray hover:text-netflix-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {!invitationLink ? (
              /* Create Invitation Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-netflix-white text-sm font-medium mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Check out ${contentTitle}! I think you'll love it.`}
                    rows={3}
                    className="w-full bg-netflix-gray/30 border border-netflix-gray/50 rounded-md px-4 py-3 text-netflix-white placeholder-netflix-text-gray focus:outline-none focus:border-netflix-red transition-colors resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateInvitation}
                    disabled={loading}
                    className="flex-1 bg-netflix-red hover:bg-netflix-red/80 disabled:bg-netflix-red/50 text-netflix-white py-3 rounded-md transition-colors font-medium"
                  >
                    {loading ? 'Creating...' : 'Create Invite Link'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 border border-netflix-gray/50 text-netflix-white rounded-md hover:bg-netflix-gray/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Show Generated Link */
              <div className="space-y-4">
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm font-medium mb-2">
                    🎉 Invitation link created!
                  </p>
                  <p className="text-netflix-text-gray text-xs">
                    Share this link with your friends. Valid for 30 days, up to 10 uses.
                  </p>
                </div>

                <div>
                  <label className="block text-netflix-white text-sm font-medium mb-2">
                    Invitation Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={invitationLink}
                      readOnly
                      className="flex-1 bg-netflix-gray/30 border border-netflix-gray/50 rounded-md px-4 py-3 text-netflix-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-3 bg-netflix-red hover:bg-netflix-red/80 text-netflix-white rounded-md transition-colors flex items-center space-x-2"
                    >
                      {copied ? <FaCheck className="text-sm" /> : <FaCopy className="text-sm" />}
                      <span className="hidden sm:inline">
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 border border-netflix-gray/50 text-netflix-white rounded-md hover:bg-netflix-gray/20 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default InvitationComponent; 