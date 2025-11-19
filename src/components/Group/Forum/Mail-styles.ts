import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";

export const InstanceContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  backgroundColor: "var(--color-instance)",
  height: "59px",
  flexShrink: 0,
  justifyContent: "space-between",
}));
export const MailContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "calc(100vh - 78px)",
  overflow: "hidden",
}));

export const MailBody = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  width: "100%",
  height: "calc(100% - 59px)",
  // overflow: 'auto !important'
}));
export const MailBodyInner = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "50%",
  height: "100%",
}));
export const MailBodyInnerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
  height: "25px",
  marginTop: "50px",
  marginBottom: "35px",
  justifyContent: "center",
  alignItems: "center",
  gap: "11px",
}));

export const MailBodyInnerScroll = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  overflow: "auto !important",
  transition: "background-color 0.3s",
  height: "calc(100% - 110px)",
  "&::-webkit-scrollbar": {
    width: 8,
    height: 8,
    backgroundColor: "transparent",
    transition: "background-color 0.3s",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "transparent",
    borderRadius: 3,
    transition: "background-color 0.3s",
  },
  "&:hover": {
    "&::-webkit-scrollbar": {
      backgroundColor: theme.palette.action.hover,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.text.secondary,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: theme.palette.text.secondary,
    },
  },
}));

export const ComposeContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "150px",
  alignItems: "center",
  gap: "7px",
  height: "100%",
  cursor: "pointer",
  transition: "0.2s background-color",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));
export const ComposeContainerBlank = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "150px",
  alignItems: "center",
  gap: "7px",
  height: "100%",
}));
export const ComposeP = styled(Typography)(({ theme }) => ({
  fontSize: "15px",
  fontWeight: 500,
}));

export const ComposeIcon = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
  cursor: "pointer",
});
export const ArrowDownIcon = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
  cursor: "pointer",
});
export const MailIconImg = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
});

export const MailMessageRowInfoImg = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
});

export const SelectInstanceContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "17px",
}));
export const SelectInstanceContainerInner = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "3px",
  cursor: "pointer",
  padding: "8px",
  transition: "all 0.2s",
  "&:hover": {
    borderRadius: "8px",
    background: theme.palette.action.hover,
  },
}));
export const SelectInstanceContainerFilterInner = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "3px",
  cursor: "pointer",
  padding: "8px",
  transition: "all 0.2s"
}));


export const InstanceLabel = styled(Typography)(({ theme }) => ({
  fontSize: "16px",
  fontWeight: 500,
  color: theme.palette.text.secondary,
}));

export const InstanceP = styled(Typography)(({ theme }) => ({
  fontSize: "16px",
  fontWeight: 500,
}));

export const MailMessageRowContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  justifyContent: "space-between",
  borderRadius: "56px 5px 10px 56px",
  paddingRight: "15px",
  transition: "background 0.2s",
  gap: "10px",
  "&:hover": {
    background: theme.palette.action.hover,
  },
}));
export const MailMessageRowProfile = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  justifyContent: "flex-start",
  gap: "10px",
  width: "50%",
  overflow: "hidden",
}));
export const MailMessageRowInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  justifyContent: "flex-start",
  gap: "7px",
  width: "50%",
}));
export const MailMessageRowInfoStatusNotDecrypted = styled(Typography)(
  ({ theme }) => ({
    fontSize: "16px",
    fontWeight: 900,
    textTransform: "uppercase",
    paddingTop: "2px",
  })
);
export const MailMessageRowInfoStatusRead = styled(Typography)(({ theme }) => ({
  fontSize: "16px",
  fontWeight: 300,
}));

export const MessageExtraInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  overflow: "hidden",
}));
export const MessageExtraName = styled(Typography)(({ theme }) => ({
  fontSize: "16px",
  fontWeight: 900,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
}));
export const MessageExtraDate = styled(Typography)(({ theme }) => ({
  fontSize: "15px",
  fontWeight: 500,
}));

export const MessagesContainer = styled(Box)(({ theme }) => ({
  width: "460px",
  maxWidth: "90%",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
}));

export const InstanceListParent = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 246px;
  max-height: 325px;
  width: 425px;
  padding: 10px 0px 7px 0px;
  background-color: var(--color-instance-popover-bg);
  border: 1px solid rgba(0, 0, 0, 0.1);
`;
export const InstanceListHeader = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--color-instance-popover-bg);
`;
export const InstanceFooter = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;
`;
export const InstanceListContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  overflow: "auto !important",
  transition: "background-color 0.3s",
  "&::-webkit-scrollbar": {
    width: 8,
    height: 8,
    backgroundColor: "transparent",
    transition: "background-color 0.3s",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "transparent",
    borderRadius: 3,
    transition: "background-color 0.3s",
  },
  "&:hover": {
    "&::-webkit-scrollbar": {
      backgroundColor: theme.palette.action.hover,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.text.secondary,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: theme.palette.text.secondary,
    },
  },
}));
export const InstanceListContainerRowLabelContainer = styled(Box)(
  ({ theme }) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "50px",
  })
);
export const InstanceListContainerRow = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  height: "50px",
  cursor: "pointer",
  transition: "0.2s background",
  "&:hover": {
    background: theme.palette.action.hover,
  },
  flexShrink: 0,
}));
export const InstanceListContainerRowCheck = styled(Box)(({ theme }) => ({
  width: "47px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
export const InstanceListContainerRowMain = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  alignItems: "center",
  paddingRight: "30px",
  overflow: "hidden",
}));
export const CloseParent = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "20px",
}));
export const InstanceListContainerRowMainP = styled(Typography)(
  ({ theme }) => ({
    fontWeight: 500,
    fontSize: "16px",
    textOverflow: "ellipsis",
    overflow: "hidden",
  })
);

export const InstanceListContainerRowCheckIcon = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
});
export const InstanceListContainerRowGroupIcon = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
});
export const TypeInAliasTextfield = styled(TextField)(({ theme }) => ({
  width: "340px", // Adjust the width as needed
  borderRadius: "5px",
  backgroundColor: theme.palette.background.paper,
  border: "none",
  outline: "none",
  input: {
    fontSize: 16,
    color: theme.palette.text.primary,
    "&::placeholder": {
      fontSize: 16,
      color: theme.palette.text.secondary,
    },
    border: "none",
    outline: "none",
    padding: "10px",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
  "& .MuiInput-underline:before": {
    borderBottom: "none",
  },
  "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
    borderBottom: "none",
  },
  "& .MuiInput-underline:after": {
    borderBottom: "none",
  },
}));

export const NewMessageCloseImg = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
  cursor: "pointer",
});
export const NewMessageHeaderP = styled(Typography)(({ theme }) => ({
  fontSize: "18px",
  fontWeight: 600,
}));

export const NewMessageInputRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "3px solid rgba(237, 239, 241, 1)",
  width: "100%",
  paddingBottom: "6px",
}));
export const NewMessageInputLabelP = styled(Typography)`
  color: rgba(84, 84, 84, 0.7);
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%; /* 24px */
  letter-spacing: 0.15px;
`;
export const AliasLabelP = styled(Typography)`
  color: rgba(84, 84, 84, 0.7);
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 120%; /* 24px */
  letter-spacing: 0.15px;
  transition: color 0.2s;
  cursor: pointer;
  &:hover {
    color: rgba(43, 43, 43, 1);
  }
`;
export const NewMessageAliasContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
}));
export const AttachmentContainer = styled(Box)(({ theme }) => ({
  height: "36px",
  width: "100%",
  display: "flex",
  alignItems: "center",
}));

export const NewMessageAttachmentImg = styled("img")(({ theme }) => ({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
  cursor: "pointer",
  padding: "10px",
  border: `1px dashed ${theme.palette.divider}`,
}));

export const NewMessageSendButton = styled(Box)(({ theme }) => ({
  borderRadius: 4,
  border: `1px solid ${theme.palette.text.primary}`,
  display: "inline-flex",
  padding: "8px 16px 8px 12px",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  width: "fit-content",
  transition: "all 0.2s",
  color: theme.palette.text.primary,
  minWidth: "120px",
  position: "relative",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
    svg: {
      path: {
        fill: theme.palette.text.primary,
      },
    },
  },
}));

export const NewMessageSendP = styled(Typography)`
  font-family: Roboto;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 120%; /* 19.2px */
  letter-spacing: -0.16px;
`;

export const ShowMessageNameP = styled(Typography)`
  font-family: Roboto;
  font-size: 16px;
  font-weight: 900;
  line-height: 19px;
  letter-spacing: 0em;
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;
export const ShowMessageTimeP = styled(Typography)`
  color: rgba(255, 255, 255, 0.5);
  font-family: Roboto;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;
export const ShowMessageSubjectP = styled(Typography)`
  font-family: Roboto;
  font-size: 16px;
  font-weight: 500;
  line-height: 19px;
  letter-spacing: 0.0075em;
  text-align: left;
`;

export const ShowMessageButton = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  padding: "8px 16px",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  width: "fit-content",
  transition: "all 0.2s",
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  minWidth: "120px",
  borderRadius: 4,
  border: `0.5px solid ${theme.palette.divider}`,
  fontFamily: "Roboto",
  cursor: "pointer",
  "&:hover": {
    borderRadius: 4,
    border: `0.5px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.action.hover,
  },
}));
export const ShowMessageReturnButton = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  padding: "8px 16px",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  width: "fit-content",
  transition: "all 0.2s",
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  minWidth: "120px",
  borderRadius: 4,
  fontFamily: "Roboto",
  cursor: "pointer",
  "&:hover": {
    borderRadius: 4,
    backgroundColor: theme.palette.action.hover,
  },
}));

export const ShowMessageButtonP = styled(Typography)(({ theme }) => ({
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 500,
  lineHeight: "120%",
  letterSpacing: "-0.16px",
  color: theme.palette.text.primary,
}));

export const ShowMessageButtonImg = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
  cursor: "pointer",
});

export const MailAttachmentImg = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
});
export const AliasAvatarImg = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
});
export const MoreImg = styled("img")({
  width: "auto",
  height: "auto",
  userSelect: "none",
  objectFit: "contain",
  transition: "0.2s all",
  "&:hover": {
    transform: "scale(1.3)",
  },
});

export const MoreP = styled(Typography)`
  color: rgba(255, 255, 255, 0.5);

  /* Attachments */
  font-family: Roboto;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%; /* 19.2px */
  letter-spacing: -0.16px;
  white-space: nowrap;
`;
export const ThreadContainerFullWidth = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  alignItems: "center",
}));
export const ThreadContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: "95%",
}));

export const GroupNameP = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: "25px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "120%",
  letterSpacing: "0.188px",
}));

export const AllThreadP = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: "20px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "120%",
  letterSpacing: "0.15px",
}));

export const SingleThreadParent = styled(Box)(({ theme }) => ({
  borderRadius: "35px 4px 4px 35px",
  position: "relative",
  background: theme.palette.background.paper,
  display: "flex",
  padding: "13px",
  cursor: "pointer",
  marginBottom: "5px",
  height: "76px",
  alignItems: "center",
  transition: "0.2s all",
  "&:hover": {
    background: theme.palette.action.hover,
  },
}));
export const SingleTheadMessageParent = styled(Box)(({ theme }) => ({
  borderRadius: "35px 4px 4px 35px",
  background: theme.palette.background.paper,
  display: "flex",
  padding: "13px",
  cursor: "pointer",
  marginBottom: "5px",
  height: "76px",
  alignItems: "center",
}));

export const ThreadInfoColumn = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "170px",
  gap: '2px',
  marginLeft: '10px',
  height: '100%',
  justifyContent: 'center'
}));


export const ThreadInfoColumnNameP = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontFamily: "Roboto",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 900,
  lineHeight: "normal",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
}));
export const ThreadInfoColumnbyP = styled("span")(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontFamily: "Roboto",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 500,
  lineHeight: "normal",
}));

export const ThreadInfoColumnTime = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontFamily: "Roboto",
  fontSize: "15px",
  fontStyle: "normal",
  fontWeight: 500,
  lineHeight: "normal",
}));
export const ThreadSingleTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontFamily: "Roboto",
  fontSize: "23px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "normal",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
}));
export const ThreadSingleLastMessageP = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontFamily: "Roboto",
  fontSize: "12px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "normal",
}));
export const ThreadSingleLastMessageSpanP = styled("span")(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontFamily: "Roboto",
  fontSize: "12px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "normal",
}));

export const GroupContainer = styled(Box)`
position: relative;
        overflow: auto;
        width: 100%;


`

export const CloseContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "50px",
  overflow: "hidden",
  alignItems: "center",
  cursor: "pointer",
  transition: "0.2s background-color",
  justifyContent: "center",
  position: 'absolute',
  top: '0px',
  right: '0px',
  height: '50px',
  borderRadius: '0px 12px 0px 0px',
  "&:hover": {
    backgroundColor: "rgba(162, 31, 31, 1)",
  },
}));
