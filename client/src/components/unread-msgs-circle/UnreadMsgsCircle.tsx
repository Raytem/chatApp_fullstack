import classNames from 'classnames';
import { FC } from 'react'
import s from './UnreadMsgsCircle.module.css'

interface UnreadMsgsCircleProps {
  className?: string;
  unreadMsgsCnt: number;
}

export const UnreadMsgsCircle: FC<UnreadMsgsCircleProps> = ({ className, unreadMsgsCnt }) => {
  return (
    <div className={classNames(s.unreadMsgsCircle, className)}>{ unreadMsgsCnt }</div>
  )
}
