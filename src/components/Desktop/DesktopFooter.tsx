import * as React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  ButtonBase,
  Typography,
  useTheme,
} from "@mui/material";
import { Home, Groups, Message, ShowChart } from "@mui/icons-material";
import Box from "@mui/material/Box";
import BottomLogo from "../../assets/svgs/BottomLogo5.svg";
import { CustomSvg } from "../../common/CustomSvg";
import { WalletIcon } from "../../assets/Icons/WalletIcon";
import { HubsIcon } from "../../assets/Icons/HubsIcon";
import { TradingIcon } from "../../assets/Icons/TradingIcon";
import { MessagingIcon } from "../../assets/Icons/MessagingIcon";
import AppIcon from "../../assets/svgs/AppIcon.svg";

import { HomeIcon } from "../../assets/Icons/HomeIcon";
import { Save } from "../Save/Save";

export const IconWrapper = ({ children, label, color, selected, disableWidth, customWidth }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap:  "5px",
        flexDirection: "column",
        height: customWidth ? customWidth : disableWidth ? 'auto' :  "89px",
        width: customWidth? customWidth : disableWidth ? 'auto' : "89px",
        borderRadius: "50%",
        backgroundColor: selected ? theme.palette.action.selected : "transparent",
      }}
    >
      {children}
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "12px",
          fontWeight: 500,
          color: color || theme.palette.text.primary,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export const DesktopFooter = ({
  selectedGroup,
  groupSection,
  isUnread,
  goToAnnouncements,
  isUnreadChat,
  goToChat,
  goToThreads,
  setOpenManageMembers,
  groupChatHasUnread,
  groupsAnnHasUnread,
  directChatHasUnread,
  chatMode,
  openDrawerGroups,
  goToHome,
  setIsOpenDrawerProfile,
  mobileViewMode,
  setMobileViewMode,
  setMobileViewModeKeepOpen,
  hasUnreadGroups,
  hasUnreadDirects,
  isHome,
  isGroups,
  isDirects,
  setDesktopSideView,
  isApps,
  setDesktopViewMode,
  desktopViewMode,
  hide,
  setIsOpenSideViewDirects,
  setIsOpenSideViewGroups,
  myName
  
}) => {
  
  if(hide) return
  return (
    <Box
      sx={{
        width: "100%",
        position: "absolute",
        bottom: 0,
        display: "flex",
        alignItems: "center",
        height: "100px", // Footer height
        zIndex: 1,
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "20px",
        }}
      >
        <ButtonBase
          onClick={() => {
            goToHome();
          }}
        >
          <IconWrapper
            color="var(--text-contrast-muted)"
            label="Home"
            selected={isHome}
          >
            <HomeIcon
              height={30}
              color={isHome ? "var(--text-contrast)" : "var(--text-contrast-muted)"}
            />
          </IconWrapper>
        </ButtonBase>
        <ButtonBase
          onClick={() => {
            setDesktopViewMode('apps')
            setIsOpenSideViewDirects(false)
            setIsOpenSideViewGroups(false)
          }}
        >
          <IconWrapper
            color="var(--text-contrast-muted)"
            label="Apps"
            selected={isApps}
          >
          <img src={AppIcon} />
          </IconWrapper>
        </ButtonBase>
        <ButtonBase
          onClick={() => {
            setDesktopSideView("groups");
          }}
        >
          <IconWrapper
            color="var(--text-contrast-muted)"
            label="Groups"
            selected={isGroups}
          >
            <HubsIcon
              height={30}
              color={
                hasUnreadGroups
                  ? "var(--unread)"
                  : isGroups
                  ? "var(--text-contrast)"
                  : "var(--text-contrast-muted)"
              }
            />
          </IconWrapper>
        </ButtonBase>
        <ButtonBase
          onClick={() => {
            setDesktopSideView("directs");
          }}
        >
          <IconWrapper
            color="var(--text-contrast-muted)"
            label="Messaging"
            selected={isDirects}
          >
            <MessagingIcon
              height={30}
              color={
                hasUnreadDirects
                  ? "var(--unread)"
                  : isDirects
                  ? "var(--text-contrast)"
                  : "var(--text-contrast-muted)"
              }
            />
          </IconWrapper>
        </ButtonBase>
        
        <Save isDesktop myName={myName} />
      </Box>
    </Box>
  );
};
