import { Box, ButtonBase, IconButton, useTheme } from '@mui/material';
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
  const muiTheme = useTheme();
  const { themeMode, toggleTheme, theme: appTheme } = useThemeContext();
  const isDarkMode = themeMode === 'dark';
  return (
    <Box
      sx={{
        width: '70px',
        flexDirection: 'column',
        height: '100vh',
        alignItems: 'center',
        display: 'flex',
        paddingY: '20px',
        backgroundColor: muiTheme.palette.background.default,
        color: muiTheme.palette.text.primary,
        borderRight: `1px solid ${muiTheme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          width: '100%',
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
                ? muiTheme.palette.text.primary
                : muiTheme.palette.text.secondary
            }
          />
        </ButtonBase>
        <ButtonBase
          onClick={() => {
            setDesktopViewMode('apps');
          }}
        >
          <IconWrapper
            color={
              isApps
                ? muiTheme.palette.text.primary
                : muiTheme.palette.text.secondary
            }
            label="Apps"
            selected={isApps}
            disableWidth
          >
            <AppsIcon
              color={
                isApps
                  ? muiTheme.palette.text.primary
                  : muiTheme.palette.text.secondary
              }
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
                ? appTheme.colors.unread
                : desktopViewMode === 'chat'
                  ? muiTheme.palette.text.primary
                  : muiTheme.palette.text.secondary
            }
            label="Chat"
            disableWidth
          >
            <MessagingIcon
              height={30}
              color={
                hasUnreadDirects || hasUnreadGroups
                  ? appTheme.colors.unread
                  : desktopViewMode === 'chat'
                    ? muiTheme.palette.text.primary
                    : muiTheme.palette.text.secondary
              }
            />
          </IconWrapper>
        </ButtonBase>
        <Save isDesktop disableWidth myName={myName} />
      </Box>
      <Box
        sx={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          paddingBottom: '10px',
        }}
      >
        <IconButton
          onClick={toggleTheme}
          sx={{
            color: muiTheme.palette.text.primary,
            backgroundColor: muiTheme.palette.background.default,
            '&:hover': {
              backgroundColor: muiTheme.palette.action.hover,
            },
          }}
        >
          {isDarkMode ? (
            <LightModeIcon fontSize="small" />
          ) : (
            <DarkModeIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};
