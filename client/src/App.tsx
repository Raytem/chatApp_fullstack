import { useEffect } from 'react'
import './App.css'
import { AppRouter } from './router/AppRouter';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from './hooks/rtkHooks';
import { authService } from './API/services/AuthService';
import { useFetch } from './hooks/useFetch';
import { setUser } from './store/userSlice';
import { setToken } from './utils/localStorage_token';
import { CircularProgress } from '@mui/material';

function App() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const navigate = useNavigate();
  const [checkIsAuth, isLoading] = useFetch<undefined>(async () => {
    const userData = await authService.refresh(); 
      dispatch(setUser(userData.user));
      setToken(userData.accessToken);
  })

  useEffect(() => {
    if (!user.id) {
      checkIsAuth();
    }

    if (user.id) {
      navigate('/chats');
    } else {
      navigate('/login');
    }
  }, [user])

  if (isLoading) {
    return (
      <div className='loaderDiv'>
        <CircularProgress className='app_loader' />
      </div>
    )
  }

  return (
    <AppRouter />
  );
}

export default App
