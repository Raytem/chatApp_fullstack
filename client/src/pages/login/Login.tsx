import { Button, FormControl, FormLabel, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material'
import React, { useState } from 'react'
import s from '../signup/signup.module.css';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { getFormFields } from '../../utils/getFormFields';
import { useFetch } from '../../hooks/useFetch';
import { authService } from '../../API/services/AuthService';
import { setToken } from '../../utils/localStorage_token';
import { LoadingButton } from '@mui/lab';
import { useAppDispatch } from '../../hooks/rtkHooks';
import { setUser } from '../../store/userSlice';
import { LoginDto } from '../../types/dtos/user/LoginDto';

export const Login = () => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [fetchLogin, isLoading, error] = useFetch<LoginDto>(async (loginDto: LoginDto | undefined) => {
    const data = await authService.login(loginDto as LoginDto);
    dispatch(setUser(data.user));
    setToken(data.accessToken);
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleToSignUp = () => {
    navigate('/signup');
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = getFormFields<LoginDto>(e.currentTarget);

    fetchLogin(formData);
  }
  
  return (
    <div className={s.page}>
    <div className={s.centeredBox}>

      <form className={s.boxInner} onSubmit={handleSubmit}>
        <h2 className={s.h2}>Login</h2>
        <TextField name='email' required type='email' label="Email" variant="outlined" />
       
        <FormControl required variant="outlined">
          <InputLabel>Password</InputLabel>
          <OutlinedInput
            name='password'
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>

        <FormLabel sx={{color: 'red'}}>{error}</FormLabel>

        <LoadingButton 
          loading={isLoading}
          loadingPosition='end' 
          endIcon=' '
          type='submit' 
          size='medium' 
          variant="contained"
        >
            Login
        </LoadingButton>

        <Button onClick={handleToSignUp} size='medium' variant="outlined">Sign Up</Button>
      </form>

    </div>
  </div>
  )
}
