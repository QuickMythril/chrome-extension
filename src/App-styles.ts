import {
  Box,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";

export const AppContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  width: "100vw",
  minHeight: "100vh",
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

export const AuthenticatedContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
  height: "100%",
  justifyContent: "space-between",
  color: theme.palette.text.primary,
}));

export const AuthenticatedContainerInnerLeft = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  background: theme.palette.background.default,
}));

export const AuthenticatedContainerInnerRight = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  width: "60px",
  height: "100%",
  background: theme.palette.background.paper,
}));

export const AuthenticatedContainerInnerTop = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  width: "100%",
  height: "60px",
  background: theme.palette.background.paper,
  padding: "20px",
}));

export const TextP = styled(Typography)(({ theme }) => ({
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "Inter",
  color: theme.palette.text.primary,
}));

export const TextItalic = styled("span")(({ theme }) => ({
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "Inter",
  color: theme.palette.text.primary,
  fontStyle: "italic",
}));

export const TextSpan = styled("span")(({ theme }) => ({
  fontSize: "13px",
  fontFamily: "Inter",
  fontWeight: 800,
  color: theme.palette.text.primary,
}));

export const AddressBox = styled(Box)(({ theme }) => ({
  display: "flex",
  border: `1px solid ${theme.palette.divider}`,
  justifyContent: "space-between",
  alignItems: "center",
  width: "auto",
  height: "25px",
  padding: "5px 15px",
  gap: "5px",
  borderRadius: "100px",
  fontFamily: "Inter",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: "14.52px",
  textAlign: "left",
  color: theme.palette.text.secondary,
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    svg: {
      path: {
        fill: theme.palette.text.primary,
      },
    },
  },
}));

interface CustomButtonProps {
  bgColor?: string;
  color?: string;
}

export const CustomButtonAccept = styled(Box)<CustomButtonProps>(
  ({ bgColor, color, theme }) => ({
    boxSizing: "border-box",
    padding: "15px 20px",
    gap: "10px",
    border: `0.5px solid ${theme.palette.divider}`,
    filter: "drop-shadow(1px 4px 10.5px rgba(0,0,0,0.3))",
    borderRadius: 5,
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    width: "fit-content",
    transition: "all 0.2s",
    minWidth: 160,
    cursor: "pointer",
    fontWeight: 600,
    fontFamily: "Inter",
    textAlign: "center",
    opacity: 0.7,
    backgroundColor: bgColor || "transparent",
    color: color || theme.palette.text.primary,
    "&:hover": {
      opacity: 1,
      backgroundColor: bgColor || theme.palette.background.paper,
      color: color || theme.palette.text.primary,
      svg: {
        path: {
          fill: color || theme.palette.text.primary,
        },
      },
    },
  })
);

export const CustomButton = styled(Box)(({ theme }) => ({
  boxSizing: "border-box",
  padding: "15px 20px",
  gap: "10px",
  border: `0.5px solid ${theme.palette.divider}`,
  filter: "drop-shadow(1px 4px 10.5px rgba(0, 0, 0, 0.3))",
  borderRadius: 5,
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  width: "fit-content",
  transition: "all 0.2s",
  minWidth: 160,
  cursor: "pointer",
  fontWeight: 600,
  fontFamily: "Inter",
  color: theme.palette.text.primary,
  textAlign: "center",
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    svg: {
      path: {
        fill: theme.palette.text.primary,
      },
    },
  },
}));

export const CustomInput = styled(TextField)(({ theme }) => ({
  width: "183px",
  borderRadius: "5px",
  outline: "none",
  input: {
    fontSize: 10,
    fontFamily: "Inter",
    fontWeight: 400,
    color: theme.palette.text.primary,
    "&::placeholder": {
      fontSize: 16,
      color: theme.palette.text.secondary,
    },
    outline: "none",
    padding: "10px",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      border: `0.5px solid ${theme.palette.divider}`,
    },
    "&:hover fieldset": {
      border: `0.5px solid ${theme.palette.divider}`,
    },
    "&.Mui-focused fieldset": {
      border: `0.5px solid ${theme.palette.divider}`,
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

export const CustomLabel = styled(InputLabel)(({ theme }) => ({
  fontWeight: 400,
  fontFamily: "Inter",
  fontSize: "10px",
  lineHeight: "12px",
  color: theme.palette.text.secondary,
}));
