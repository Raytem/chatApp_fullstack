import { FC, useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../../hooks/rtkHooks';
import { TypingStatusDto } from '../../types/dtos/privateChat/TypingStatusDto';

interface TypingStatusItemProps {
  typingStatus: TypingStatusDto;
}

export const TypingStatusItem: FC<TypingStatusItemProps> = ({
  typingStatus,
}) => {
  const curChat = useAppSelector(state => state.chat.curChat);

  const [typingDots, setTypingDots] = useState<string>('');

  const intervalId = useRef<NodeJS.Timer | null>(null);
  useEffect(() => {
    if (typingStatus?.isTyping) {
      intervalId.current = setInterval(() => {
        setTypingDots(prev => `${prev}.`);
      }, 350)
    }
    if (!typingStatus?.isTyping) {
      clearInterval(intervalId.current as NodeJS.Timer);
    }
    return () => {
      clearInterval(intervalId.current as NodeJS.Timer);
    }
  }, [typingStatus, curChat.id]);

  useEffect(() => {
    if (typingDots.length === 4) {
      setTypingDots('')
    }
  }, [typingDots])

  return (
    <>
      <span>is typing</span>
      <span>{typingDots}</span>
    </> 
  )
}
