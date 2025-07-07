import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import MainLayout from '../../components/ui/MainLayout';
import ParticleBackground from '../../components/ui/ParticleBackground';
import { getInvitation, useInvitation } from '../../src/utils/socialUtils';
import { FaCheckCircle, FaTimesCircle, FaPlay } from 'react-icons/fa';

function InvitationPage() {
  const router = useRouter();
  const { inviteCode } = router.query;
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      loadInvitation();
    }
  }, [inviteCode]);

  const loadInvitation = async () => {
    try {
      const inviteData = await getInvitation(inviteCode);
      if (inviteData) {
        setInvitation(inviteData);
      } else {
        setError('Invitation not found or expired');
      }
    } catch (error) {
      console.error('Error loading invitation:', error);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    setProcessing(true);
    try {
      await useInvitation(inviteCode);
      
      // Redirect to content
      const targetUrl = invitation.contentType === 'movie' 
        ? `/movies/info/${invitation.contentId}`
        : `/shows/info/${invitation.contentId}`;
      
      router.push(targetUrl);
    } catch (error) {
      console.error('Error processing invitation:', error);
      setError('Failed to process invitation');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <ParticleBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Loading invitation...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Invitation Error - NetFlex</title>
        </Head>
        <MainLayout>
          <ParticleBackground />
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md mx-auto text-center p-8">
              <FaTimesCircle className="text-6xl text-netflix-red mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-netflix-white mb-4">
                Invitation Error
              </h1>
              <p className="text-netflix-text-gray mb-6">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-netflix-red hover:bg-netflix-red/80 text-netflix-white rounded-md transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </MainLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>You're Invited! - NetFlex</title>
        <meta name="description" content={invitation.message} />
      </Head>
      
      <MainLayout>
        <ParticleBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md mx-auto text-center p-8 bg-netflix-black/80 border border-netflix-gray/30 rounded-lg shadow-2xl">
            <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
            
            <h1 className="text-3xl font-bold text-netflix-white mb-4">
              You're Invited!
            </h1>
            
            <div className="mb-6">
              <p className="text-netflix-text-gray mb-4">
                Someone wants to share this {invitation.contentType} with you:
              </p>
              
              <div className="p-4 bg-netflix-gray/20 rounded-lg border border-netflix-gray/30 mb-4">
                <p className="text-netflix-white font-medium italic">
                  "{invitation.message}"
                </p>
              </div>
              
              <div className="text-sm text-netflix-text-gray space-y-1">
                <p>Content Type: <span className="text-netflix-white capitalize">{invitation.contentType}</span></p>
                <p>Shared on: <span className="text-netflix-white">{new Date(invitation.createdAt).toLocaleDateString()}</span></p>
                <p>Uses remaining: <span className="text-netflix-white">{invitation.maxUses - invitation.currentUses}</span></p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAcceptInvitation}
                disabled={processing}
                className="w-full bg-netflix-red hover:bg-netflix-red/80 disabled:bg-netflix-red/50 text-netflix-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaPlay className="text-sm" />
                    <span>Accept & Watch</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full border border-netflix-gray/50 text-netflix-white py-3 px-6 rounded-md hover:bg-netflix-gray/20 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}

export default InvitationPage; 