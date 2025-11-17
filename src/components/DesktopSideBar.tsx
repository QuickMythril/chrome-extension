import { Box, ButtonBase } from '@mui/material';
import React from 'react';
import { HomeIcon } from '../assets/Icons/HomeIcon';
import { MessagingIcon } from '../assets/Icons/MessagingIcon';
import { Save } from './Save/Save';
import { CoreSyncStatus } from './CoreSyncStatus';
import { IconWrapper } from './Desktop/DesktopFooter';
import AppIcon from './../assets/svgs/AppIcon.svg';
import { AppsIcon } from '../assets/Icons/AppsIcon';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeContext } from '../context/ThemeContext';

export const DesktopSideBar = ({
  goToHome,
  setDesktopSideView,
  toggleSideViewDirects,
  hasUnreadDirects,
  isDirects,
  toggleSideViewGroups,
  hasUnreadGroups,
  isGroups,
  isApps,
  setDesktopViewMode,
  desktopViewMode,
  myName,
}) => {
  const { themeMode, toggleTheme } = useThemeContext();
  const isDarkMode = themeMode === 'dark';
  return (
    <Box
      sx={{
        width: '60px',
        flexDirection: 'column',
        height: '100vh',
        alignItems: 'center',
        display: 'flex',
        gap: '25px',
        paddingTop: '20px',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-contrast)',
      }}
    >
      <Box
        sx={{
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CoreSyncStatus imageSize="30px" position="left" />
      </Box>
      <ButtonBase
        sx={{
          width: '60px',
          height: '60px',
          paddingTop: '5px',
        }}
        onClick={() => {
          goToHome();
        }}
      >
        <HomeIcon
          height={34}
          color={
            desktopViewMode === 'home'
              ? 'var(--text-contrast)'
              : 'var(--text-contrast-muted)'
          }
        />
      </ButtonBase>
      <ButtonBase
        onClick={() => {
          setDesktopViewMode('apps');
          // setIsOpenSideViewDirects(false)
          // setIsOpenSideViewGroups(false)
        }}
      >
        <IconWrapper
          color={isApps ? 'var(--text-contrast)' : 'var(--text-contrast-muted)'}
          label="Apps"
          selected={isApps}
          disableWidth
        >
          <AppsIcon
            color={isApps ? 'var(--text-contrast)' : 'var(--text-contrast-muted)'}
            height={30}
          />
        </IconWrapper>
      </ButtonBase>
      <ButtonBase
        onClick={() => {
          setDesktopViewMode('chat');
        }}
      >
        <IconWrapper
          color={
            hasUnreadDirects || hasUnreadGroups
              ? 'var(--unread)'
              : desktopViewMode === 'chat'
                ? 'var(--text-contrast)'
                : 'var(--text-contrast-muted)'
          }
          label="Chat"
          disableWidth
        >
          <MessagingIcon
            height={30}
            color={
              hasUnreadDirects || hasUnreadGroups
                ? 'var(--unread)'
                : desktopViewMode === 'chat'
                  ? 'var(--text-contrast)'
                  : 'var(--text-contrast-muted)'
            }
          />
        </IconWrapper>
      </ButtonBase>
      {/* <ButtonBase
        onClick={() => {
          setDesktopSideView("groups");
          toggleSideViewGroups()
        }}
      >
          <HubsIcon
            height={30}
            color={
              hasUnreadGroups
                ? "var(--danger)"
                : isGroups
                ? "white"
                : "rgba(250, 250, 250, 0.5)"
            }
          />
   
      </ButtonBase> */}
      <Save isDesktop disableWidth myName={myName} />
      <ButtonBase
        onClick={toggleTheme}
        sx={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-2)',
        }}
      >
        {isDarkMode ? (
          <LightModeIcon sx={{ color: 'var(--text-contrast)' }} fontSize="small" />
        ) : (
          <DarkModeIcon sx={{ color: 'var(--text-contrast)' }} fontSize="small" />
        )}
      </ButtonBase>
    </Box>
  );
};
