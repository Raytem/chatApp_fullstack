import React, { FC } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { userService } from '../../API/services/UserService'
import { useAppDispatch, useAppSelector } from '../../hooks/rtkHooks'
import { updateUser } from '../../store/userSlice'
import { Button, FormLabel, Modal, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import classNames from 'classnames'
import shared from '../../shared.module.css'
import s from './UpdateUserInfoModal.module.css'

interface UpdateUserInfoPropsModal {
  open: boolean;
  onClose: () => void;
}

export const UpdateUserInfoModal: FC<UpdateUserInfoPropsModal> = ({
  open,
  onClose,
}) => {
  const curUser = useAppSelector(state => state.user.user);
  const dispatch = useAppDispatch();

  const [fetchUpdate, updateIsLoading, updateError] = useFetch<FormData>(async (formData: FormData | undefined) => {
    const updatedUser = await userService.update(curUser.id, formData as FormData);
    dispatch(updateUser(updatedUser));
    onClose();
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    fetchUpdate(formData);
  }

  const handleCancel= () => {
    onClose()
  }

  return (
    <Modal 
      open={open}
      onClose={onClose}
      closeAfterTransition
    >
      <div className={classNames(s.updateUserInfoBlock_wrapper, shared.modal_wrapper)}>
        <div className={s.updateUserInfoBlock}>
          <form className={s.boxInner} onSubmit={handleSubmit}>
            <h2 className={s.h2}>Update Profile</h2>
            <TextField 
              name='name' 
              label="Name" 
              variant="outlined" 
              size='medium' 
              defaultValue={curUser.name}
              required
            />
            <TextField 
              name='surname' 
              label="Surname" 
              variant="outlined" 
              size='medium' 
              defaultValue={curUser.surname}
              required
            />

            <Button variant="outlined" component='label'>
              Photo (5mb max)
              <input type="file" name='avatar' accept='image/*' hidden/>
            </Button>

            <FormLabel sx={{color: 'red'}}>{ updateError }</FormLabel>

            <LoadingButton 
              loading={updateIsLoading || updateIsLoading} 
              loadingPosition='end' 
              endIcon=' ' 
              type='submit' 
              size='medium' 
              variant="contained">
              Update
            </LoadingButton>

            <Button onClick={handleCancel} size='medium' variant="outlined">Cancel</Button>
          </form>
        </div>
      </div>
    </Modal>
  )
}
