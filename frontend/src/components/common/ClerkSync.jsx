import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser, clearAuth } from '../../redux/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const ClerkSync = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // Fetch user from our backend to get role and DB _id
        dispatch(fetchCurrentUser()).then((result) => {
          if (result.meta.requestStatus === 'fulfilled' && result.payload) {
            if (!result.payload.hasFinishedSetup && location.pathname !== '/select-role') {
              navigate('/select-role');
            }
          }
        });
      } else {
        dispatch(clearAuth());
      }
    }
  }, [isLoaded, isSignedIn, dispatch]);

  return null; // Silent component
};

export default ClerkSync;
