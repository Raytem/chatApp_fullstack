import { Button, FormControl, FormLabel, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import React, { useState } from 'react'
import s from './signup.module.css';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router';
import { setToken } from '../../utils/localStorage_token';
import { authService } from '../../API/services/AuthService';
import { useFetch } from '../../hooks/useFetch';
import { LoadingButton } from '@mui/lab';
import { useAppDispatch } from '../../hooks/rtkHooks';
import { setUser } from '../../store/userSlice';

export const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fetchSignUp, isLoading, error] = useFetch<FormData>(async (createUserDto: FormData | undefined) => {
    const data = await authService.signUp(createUserDto as FormData);
    dispatch(setUser(data.user));
    setToken(data.accessToken);
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleToLogin = () => {
    navigate('/login');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handelDatePick = (data: any) => {
    setBirthday(data.$d);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!birthday) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append('birthday', birthday.toDateString());
    fetchSignUp(formData);
  }

  return (
    <div className={s.page}>
      <div className={s.centeredBox}>

          <form className={s.boxInner} onSubmit={handleSubmit}>
            <h2 className={s.h2}>Sign up</h2>
            <TextField name='name' required label="Name" variant="outlined" />
            <TextField name='surname' required label="Surname" variant="outlined" />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker onChange={handelDatePick} label="Date of birth" />
            </LocalizationProvider>

            <TextField name='email' type='email' required label="Email" variant="outlined" />
            
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

            <Button variant="outlined" component='label' size='large' sx={{textAlign: 'center'}}>
              Photo (5mb max)
              <input type="file" name='avatar' accept='image/*' hidden/>
            </Button>

            <FormLabel sx={{color: 'red'}}>{ error }</FormLabel>

            <LoadingButton loading={isLoading} loadingPosition='end' endIcon=' ' type='submit' size='medium' variant="contained">
              Register
            </LoadingButton>
            <Button onClick={handleToLogin} size='medium' variant="outlined">Login</Button>
          </form>

      </div>
    </div>
  )
}

