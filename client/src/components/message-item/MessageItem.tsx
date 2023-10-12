import React, { useRef, useState } from 'react'
import s from './messageItem.module.css'
import { Message } from '../../types/interfaces/Message';
import { useAppSelector } from '../../hooks/rtkHooks';
import { formatDate_time } from '../../utils/formatDate';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { MessageItemPopover } from '../message-item-popover/MessageItemPopover';


interface MessageItemProps {
  message: Message;
  setIsEditMode: (val: boolean) => void, 
  setMsgToEdit: (val: Message) => void,
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, setIsEditMode, setMsgToEdit }) => {
  const curUser = useAppSelector(state => state.user.user);

  const msgTime = formatDate_time(message.createdAt);

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const msgBlockRef = useRef<HTMLDivElement | null>(null);

  const [mouseTopPos, setMouseTopPos] = useState<number>(0);
  const [mouseLeftPos, setMouseLeftPos] = useState<number>(0);
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (message.user.id === curUser.id) {
      setMouseTopPos(e.pageY);
      setMouseLeftPos(e.pageX)
      setIsPopoverOpen(true);
      msgBlockRef.current?.classList.add(s.selectedMsgBlock)
    }
  };


  let msgBlockStyleClass = s.messageBlock_left;
  let messageStyleClass = s.message_left;
  let readStatusElement;

  if (message.user.id === curUser.id) {
    msgBlockStyleClass = s.messageBlock_right;
    messageStyleClass = s.message_right;
    
    if (message.isRead) {
      readStatusElement = <DoneAllIcon className={s.doneIcon} style={{fontSize: 16}} color='disabled' />;
    } else {
      readStatusElement = <DoneIcon className={s.doneIcon} style={{fontSize: 16}} color='disabled' />;
    }
  } 

  function createMsgText() {
    const strArr = message.text.replace(' ', '&nbsp').split('\n')

    const resStr = strArr.map(el => {
      if (el === '') {
        return '<br>'
      }
      if (strArr.lastIndexOf(el) !== strArr.length - 1) {
          return `${el}<br>`
      }
      return el
    }).join('');

    return {__html: resStr}
  }

  return (<>
    <div 
      className={msgBlockStyleClass} 
      onContextMenu={handleClick}
      ref={msgBlockRef}
    >
      <div className={messageStyleClass}>
        <p>
          <span dangerouslySetInnerHTML={createMsgText()}/>
          <span className={ s.msgInfo }>
          <p className={s.msgTime}>{ message.isEdited ? 'edited' : '' }</p>
          <p className={s.msgTime}>{ msgTime }</p>
          { readStatusElement }
        </span>
        </p>
        
      </div>
    </div>

    <MessageItemPopover 
      message={message}
      isOpen={isPopoverOpen}
      setIsOpen={setIsPopoverOpen}
      msgBlockRef={msgBlockRef}
      mouseTopPos={mouseTopPos}
      mouseLeftPos={mouseLeftPos}
      setIsEditMode={setIsEditMode}
      setMsgToEdit={setMsgToEdit}
    />
  </>)
}
