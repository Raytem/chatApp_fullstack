import { FC, RefObject } from 'react'
import msgItemStyles from '../message-item/messageItem.module.css'
import { Button, Popover, Stack } from '@mui/material'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Message } from '../../types/interfaces/Message';
import { useAppSelector } from '../../hooks/rtkHooks';
import { usePrivateChat } from '../../hooks/usePrivateChat';

interface MessageItemPopoverProps {
  message: Message;
  mouseTopPos: number;
  mouseLeftPos: number;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  msgBlockRef: RefObject<HTMLDivElement | null>
  setIsEditMode: (val: boolean) => void, 
  setMsgToEdit: (val: Message) => void,
}

export const MessageItemPopover: FC<MessageItemPopoverProps> = ({
  message,
  mouseTopPos,
  mouseLeftPos,
  isOpen,
  setIsOpen,
  msgBlockRef,
  setIsEditMode,
  setMsgToEdit
}) => {
  const curChat = useAppSelector(state => state.chat.curChat);
  const { chatActions } = usePrivateChat();

  function onPopoverClick() {
    setIsOpen(false);
    msgBlockRef.current?.classList.remove(msgItemStyles.selectedMsgBlock)
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDelete = () => {
    chatActions.removeMsg({chatId: curChat.id, msgId: message.id});
  }

  const handleEdit = () => {
    setIsEditMode(true);
    setMsgToEdit(message);
  }

  return (
    <Popover
      open={isOpen}
      onClick={onPopoverClick}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{
        top: mouseTopPos + 7,
        left: mouseLeftPos + 7,
      }}
    >
      <Stack alignItems='stretch'>
        <Button 
          onClick={handleEdit} 
          size='medium' 
          color='primary' 
          sx={{ pl: 1.5, pr: 1.5, justifyContent: 'flex-start', textTransform: 'none' }} 
          startIcon={<EditOutlinedIcon fontSize='medium' />}
        >
          Edit
        </Button>

        <Button 
          onClick={handleDelete} 
          size='medium' 
          color='error' 
          sx={{ pl: 1.5, pr: 1.5, justifyContent: 'flex-start', textTransform: 'none' }} 
          startIcon={<DeleteOutlineOutlinedIcon 
          fontSize='medium' />}
        >
          Delete
        </Button>
      </Stack>
    </Popover>
  )
}
