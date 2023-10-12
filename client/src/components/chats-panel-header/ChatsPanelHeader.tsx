import React, { useEffect } from 'react'
import s from './ChatsPanelHeader.module.css'
import { IconButton, InputAdornment, Tab, Tabs, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { ChatPanelTab } from '../../types/enums/ChatPanelTab';
import { User } from '../../types/interfaces/User';
import { PrivateChat } from '../../types/interfaces/PrivateChat';
import { UserFilterDto } from '../../types/dtos/user/UserFilterDto';

interface ChatsPanelHeaderProps {
  users: User[];
  setUsers: (prev: User[]) => void;
  chats: PrivateChat[];
  setFilteredChats: (prev: PrivateChat[]) => void;
  tabIdx: ChatPanelTab;
  setTabIdx: (prev: ChatPanelTab) => void;
  searchValue: string;
  setSearchValue: (prev: string) => void;
  fetchUsers:(userFilterDto: UserFilterDto) => void;
}

export const ChatsPanelHeader: React.FC<ChatsPanelHeaderProps> = ({
  setUsers,
  chats,
  setFilteredChats,
  tabIdx,
  setTabIdx,
  searchValue,
  setSearchValue,
  fetchUsers
}) => {

  useEffect(() => {
    if (searchValue.length === 0) {
      setUsers([])
    }

    if (searchValue) {
      if (tabIdx === ChatPanelTab.CHATS) {
        const fChats = chats.filter(chat => {
          return chat.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase());
        })
        setFilteredChats(fChats);
      }
    }
  }, [searchValue, tabIdx])

  useEffect(() => {
    setSearchValue('');
  }, [tabIdx])

  const handleTabChange = (e: React.SyntheticEvent, newValue: ChatPanelTab) => {
    e
    setTabIdx(newValue);
  }

  const handleClearSearch = () => {
    setSearchValue('');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSearchChange = (e: any) => {
    const value = e.currentTarget.value;
    setSearchValue(value);

    if (value.length > 1 && tabIdx === ChatPanelTab.USERS) {
      fetchUsers({fullName: value});
    }
    if (value.length === 0) {
      setUsers([])
    }
  }

  return (
    <div className={s.chatsPanel_header}>
      <div className={s.searchInputBlock}>
        <TextField
          className={s.searchInput}
          placeholder='Search'
          variant='outlined'
          size='small'
          value={searchValue}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position='end'>
                <SearchIcon sx={{pr: 0.8}} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                {searchValue 
                ? 
                  <IconButton size='small' onClick={handleClearSearch}>
                    <ClearIcon fontSize='small'></ClearIcon>
                  </IconButton> 
                :
                  <></>
                }
              </InputAdornment>
            )
          }}
        />
      </div>

      <Tabs value={tabIdx} onChange={handleTabChange}>
        <Tab value={ ChatPanelTab.USERS } label='users' style={{flexGrow: 1, padding: 19, maxWidth: '100%'}}></Tab>
        <Tab value={ ChatPanelTab.CHATS } label='chats' style={{flexGrow: 1, padding: 19, maxWidth: '100%'}}></Tab>
      </Tabs>
    </div>
  )
}
