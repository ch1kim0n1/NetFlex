import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to home page with login prompt
        router.push('/?login=true');
        return;
      }

      if (requireAdmin && (!isAuthenticated || !isAdmin)) {
        // Redirect to home page for non-admin users
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAuth, requireAdmin, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-netflix-black">
        <div className="text-netflix-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render children if requirements not met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    return null;
  }

  return children;
};

export default ProtectedRoute; 