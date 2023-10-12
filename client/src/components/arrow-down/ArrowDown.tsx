import React from 'react'
import s from './ArrowDown.module.css'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIosNew';
import { UnreadMsgsCircle } from '../unread-msgs-circle/UnreadMsgsCircle';

interface ArrowDownProps {
  isVisible: boolean,
  unreadMsgsCnt: number,
  handleClick: () => void;
}

export const ArrowDown: React.FC<ArrowDownProps> = ({isVisible ,handleClick, unreadMsgsCnt}) => {

  return (
    <div
      className={ isVisible ? s.arrowDownBtn_active : s.arrowDownBtn}
      onClick={handleClick}
    >
      <ArrowBackIosIcon className={s.arrowDownBtn_arrow} />
      {
        (unreadMsgsCnt > 0 ) ?
        <UnreadMsgsCircle 
          className={s.arrowDownBtn_unreadCnt}
          unreadMsgsCnt={unreadMsgsCnt}
        /> 
        : <></>
      }
    </div>
  )
}
