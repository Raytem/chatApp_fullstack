import React, { useState } from 'react'
import s from './curUserPanel.module.css'
import shared from '../../shared.module.css'
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Avatar, Button, IconButton, Tooltip } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../hooks/rtkHooks';
import { clearToken } from '../../utils/localStorage_token';
import { authService } from '../../API/services/AuthService';
import { clearUser } from '../../store/userSlice';
import { clearCurChat } from '../../store/chatSlice';
import { usePrivateChat } from '../../hooks/usePrivateChat'
import classNames from 'classnames';
import { UpdateUserInfoModal } from '../update-user-info-modal/UpdateUserInfoModal';
import { clearChats } from '../../store/chatsSlice';

interface CurUserPanelProps {

}

export const CurUserPanel: React.FC<CurUserPanelProps> = () => {
  const dispatch = useAppDispatch();
  const curUser = useAppSelector(state => state.user.user);

  const { chatActions } = usePrivateChat();
  const [updateAvatarModal, setUpdateAvatarModal] = useState<boolean>(false);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(clearUser());
    dispatch(clearCurChat());
    dispatch(clearChats());
    clearToken();
    chatActions.disconnect();
    document.title = import.meta.env.VITE_APP_TITLE;
  }

  const handleOpenUpdateAvatarModal = () => {
    setUpdateAvatarModal(true);
  }

  const handleCloseUpdateAvatarModal = () => {
    setUpdateAvatarModal(false);
  }

  return (
    <div className={s.curUserInfoSection}>

      <Tooltip title='Update profile' arrow>
        <Button 
          sx={{textTransform: 'none', color: 'inherit', fontSize: 'inherit', borderRadius: '10px'}}
          color='inherit'
        >
          <div 
            className={classNames(s.curUserInfoSection_left, shared.one_line_textCutter)}
            onClick={handleOpenUpdateAvatarModal}
          >
              <Avatar
                sx={{height: 48, width: 48}}
                alt={ curUser.name }
                src={curUser?.avatar} 
              />

              <h4 className={classNames(shared.one_line_textCutter)}>
                { curUser.name } {curUser.surname}
              </h4>
          </div>
        </Button>
      </Tooltip>

      <Tooltip title='Logout' arrow>
        <IconButton onClick={handleLogout} size='large' color='error'>
          <ExitToAppIcon fontSize='medium' color='error'/>
        </IconButton>
      </Tooltip>

      <UpdateUserInfoModal
        open={updateAvatarModal}
        onClose={handleCloseUpdateAvatarModal}
      />
    </div>
  )
}
