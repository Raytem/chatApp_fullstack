import { FC, useState } from 'react'
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Button, Popover, Stack } from '@mui/material';
import { PrivateChat } from '../../types/interfaces/PrivateChat';
import { RemoveChatModal } from '../remove-chat-modal/RemoveChatModal';
import { useAppDispatch } from '../../hooks/rtkHooks';
import { pinChat, unpinChat } from '../../store/chatsSlice';
import { useFetch } from '../../hooks/useFetch';
import { chatService } from '../../API/services/ChatService';
import { UpdateChatDto } from '../../types/dtos/privateChat/UpdateChatDto';

interface ChatItemPopoverProps {
  chat: PrivateChat;
  mouseTopPos: number;
  mouseLeftPos: number;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const ChatItemPopover: FC<ChatItemPopoverProps> = ({
  chat,
  mouseTopPos,
  mouseLeftPos,
  isOpen,
  setIsOpen
}) => {
  const dispatch = useAppDispatch();

  const [removeChatModal, setRemoveChatModal] = useState<boolean>(false);
  const [updateChat] = useFetch<UpdateChatDto>(async (updateChatDto: UpdateChatDto | undefined) => {
    await chatService.updateChat(chat.id, updateChatDto as UpdateChatDto);
  });

  const onPopoverClick = () => {
    setIsOpen(false);
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCloseRemoveChatModal = () => {
    setRemoveChatModal(false);
  }

  const handlePin = () => {
    updateChat({
      isPinned: true,
    });
    dispatch(pinChat(chat));
  }

  const handleUnpin = () => {
    updateChat({
      isPinned: false,
    });
    dispatch(unpinChat(chat));
  }

  const handleDelete = () => {
    setRemoveChatModal(true);
  }

  return (
    <>
      <Popover
        open={isOpen}
        onClose={handleClose}
        onClick={onPopoverClick}
        anchorReference="anchorPosition"
        anchorPosition={{
          top: mouseTopPos + 7,
          left: mouseLeftPos + 7,
        }}
      >
        <Stack alignItems='stretch'>
          <Button 
            onClick={chat.isPinned ? handleUnpin : handlePin} 
            size='medium' 
            color='primary'
            sx={{ pl: 1.5, pr: 1.5, justifyContent: 'flex-start', textTransform: 'none' }} 
            startIcon={<PushPinOutlinedIcon fontSize='medium' />}
          >
            { chat.isPinned ? 'Unpin' : 'Pin' }
          </Button>
          <Button 
            onClick={handleDelete} 
            size='medium' 
            color='error' 
            sx={{ pl: 1.5, pr: 1.5, justifyContent: 'flex-start', textTransform: 'none' }} 
            startIcon={<DeleteOutlineOutlinedIcon fontSize='medium' />}
          >
            Delete
          </Button>
        </Stack>
      </Popover>

      <RemoveChatModal
        open={removeChatModal}
        onClose={handleCloseRemoveChatModal}
        chat={chat}
      />
    </>
  )
}
