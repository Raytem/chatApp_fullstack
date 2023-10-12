import React from 'react'
import { User } from '../../types/interfaces/User';
import { UserItem } from '../user-item/UserItem';
import { CircularProgress } from '@mui/material';
import s from './userList.module.css'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import SearchIcon from '@mui/icons-material/Search';
import { ChatPanelTab } from '../../types/enums/ChatPanelTab';

interface UserListProps {
  users: User[];
  searchValue: string;
  setTabIdx: (val: ChatPanelTab) => void;
  isLoading: boolean;
  error: string;
}

export const UserList: React.FC<UserListProps> = ({ users, searchValue, setTabIdx, isLoading, error }) => {

  if (isLoading) {
    return (
      <div className={s.loadingPanel}>
        <CircularProgress className={ s.loader } />
      </div>
    )
  }

  if (error) {
    return (
      <div className={s.loadingPanel}>
        <div className={ s.loader }>
          <ErrorOutlineIcon fontSize='large' className={ s.loader }/>
          <h3>Something wrong</h3>
        </div>
      </div>
    )
  }

  if (!error && !isLoading && !users.length && searchValue.length) {
    return (
      <div className={s.loadingPanel}>
        <div className={ s.loader }>
          <SearchOffIcon fontSize='large'/>
          <h3>No such users were found</h3>
        </div>
      </div>
    )
  }


  if (!error && !isLoading && !users.length && !searchValue.length) {
    return (
      <div className={s.loadingPanel}>
        <div className={ s.loader }>
          <SearchIcon fontSize='large' />
          <h3>Find your friends</h3>
        </div>
      </div>
    )
  }

  return (<>
    {
      users.map(user => {
        return (
          <UserItem 
            key={ user.id }
            user={ user } 
            setTabIdx={ setTabIdx }
          />
        )
      })
    }  
  </>)
}
