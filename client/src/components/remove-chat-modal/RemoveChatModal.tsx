import { FC } from 'react'
import s from './RemoveChatModal.module.css'
import shared from '../../shared.module.css'
import { Avatar, Button, Modal } from '@mui/material';
import classNames from 'classnames';
import { PrivateChat } from '../../types/interfaces/PrivateChat';
import { usePrivateChat } from '../../hooks/usePrivateChat';

interface RemoveChatModalProps {
  open: boolean;
  onClose: () => void;
  chat: PrivateChat;
}

export const RemoveChatModal: FC<RemoveChatModalProps> = ({
  open,
  onClose,
  chat,
}) => {
const {chatActions} = usePrivateChat();

  const handleDelForAll = () => {
    chatActions.deleteChat({
      chatId: chat.id,
      isFullDelete: true,
    })
    onClose();
  }


  const handleDelForMe = () => {
    chatActions.deleteChat({
      chatId: chat.id,
      isFullDelete: false,
    })
    onClose();
  }

  const handleCancel = () => {
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <div className={classNames(s.removeChatModal_wrapper, shared.modal_wrapper)}>
        <div className={s.removeChatModal}>
          <div className={s.removeChatModal_inner}>

            <div className={s.removeChatModal_header}>
              <Avatar sx={{height: 35, width: 35, mr: '15px'}} alt={ chat.name } src={ chat.avatar } />
              <h3>Delete chat</h3>
            </div>

            <p>Permanently delete chat with { chat.name }?</p>

            <div className={s.removeChatModal_buttonBlock}>
              <Button
                color='error'
                variant='outlined'
                onClick={handleDelForAll}
              >
                Delete for me and {chat.name}
              </Button>

              <Button
                color='error'
                variant='outlined'
                onClick={handleDelForMe}
              >
                Delete just for me
              </Button>

              <Button
                variant='outlined'
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
