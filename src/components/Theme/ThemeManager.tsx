import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CloseIcon from "@mui/icons-material/Close";
import { Sketch } from "@uiw/react-color";
import { rgbStringToHsva, rgbaStringToHsva } from "@uiw/color-convert";
import { useThemeContext } from "../../context/ThemeContext";
import {
  ThemeColors,
  ThemeDefinition,
  ThemeDefinitionInput,
  ThemeMode,
  THEME_COLOR_FIELDS,
  cloneThemeColors,
  defaultThemeDefinition,
} from "../../theme/themes";
import { saveFileToDiskGeneric } from "../../utils/generateWallet/generateWallet";
import {
  normalizeThemeImport,
  serializeThemeDefinition,
  ThemeValidationError,
} from "../../theme/themeSchema";

interface ThemeManagerDialogProps {
  open: boolean;
  onClose: () => void;
}

type ThemeDraft = ThemeDefinitionInput;

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

const detectColorFormat = (color?: string) => {
  if (typeof color !== "string") return null;
  if (color.startsWith("rgba")) return "rgba";
  if (color.startsWith("rgb")) return "rgb";
  if (color.startsWith("#")) return "hex";
  return null;
};

const toSketchColor = (value: string) => {
  const format = detectColorFormat(value);
  if (format === "rgba") {
    return rgbaStringToHsva(value);
  }
  if (format === "rgb") {
    return rgbStringToHsva(value);
  }
  return value || "#ffffff";
};

const formatColorValue = (color: any) => {
  if (typeof color?.rgba?.a === "number" && color.rgba.a < 1) {
    const { r, g, b, a } = color.rgba;
    const alpha = Math.round(a * 100) / 100;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color.hex;
};

const readThemeFile = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  return new Promise<string>((resolve, reject) => {
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error("FILE_SELECTION_CANCELLED"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("UNSUPPORTED_FILE_CONTENT"));
        }
      };
      reader.onerror = () => reject(new Error("FAILED_TO_READ_FILE"));
      reader.readAsText(file);
    };
    input.click();
  });
};

const ThemeManagerDialog = ({ open, onClose }: ThemeManagerDialogProps) => {
  const { themes, currentThemeId, selectTheme, deleteTheme, saveTheme } =
    useThemeContext();
  const muiTheme = useTheme();
  const [draft, setDraft] = useState<ThemeDraft | null>(null);
  const [activeTab, setActiveTab] = useState<ThemeMode>("light");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const startEditing = (theme?: ThemeDefinition) => {
    if (theme) {
      setDraft({
        id: theme.id,
        name: theme.name,
        light: cloneThemeColors(theme.light),
        dark: cloneThemeColors(theme.dark),
      });
    } else {
      setDraft({
        name: "",
        light: cloneThemeColors(defaultThemeDefinition.light),
        dark: cloneThemeColors(defaultThemeDefinition.dark),
      });
    }
    setActiveTab("light");
  };

  const resetDraft = () => {
    setDraft(null);
  };

  const handleSaveDraft = () => {
    if (!draft) return;
    saveTheme(draft);
    setFeedback({ type: "success", message: `${draft.name || "Custom theme"} saved.` });
    resetDraft();
  };

  const handleImportTheme = async () => {
    try {
      const fileContent = await readThemeFile();
      const parsed = JSON.parse(fileContent);
      const normalized = normalizeThemeImport(parsed);
      saveTheme(normalized);
      setFeedback({ type: "success", message: `${normalized.name} imported.` });
    } catch (error: any) {
      if (error?.message === "FILE_SELECTION_CANCELLED") {
        return;
      }
      if (error instanceof SyntaxError) {
        setFeedback({ type: "error", message: "That file is not valid JSON." });
        return;
      }
      if (error instanceof ThemeValidationError) {
        setFeedback({ type: "error", message: error.message });
        return;
      }
      setFeedback({
        type: "error",
        message: "Unable to import that file.",
      });
    }
  };

  const handleExportTheme = async (theme: ThemeDefinition) => {
    try {
      const filename = `${theme.name || "theme"}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .concat("-theme.json");
      const canonicalTheme = serializeThemeDefinition(theme);
      const blob = new Blob([JSON.stringify(canonicalTheme, null, 2)], {
        type: "application/json",
      });
      await saveFileToDiskGeneric(blob, filename);
      setFeedback({ type: "success", message: `${theme.name} exported.` });
    } catch (error) {
      setFeedback({ type: "error", message: "Unable to export theme." });
    }
  };

  const currentDraftColors = draft ? draft[activeTab] : null;

  const renderColorEditors = () => {
    if (!currentDraftColors) return null;
    return (
      <Grid container spacing={2} mt={1}>
        {THEME_COLOR_FIELDS.map(({ key, label }) => (
          <Grid item xs={12} sm={6} key={`${activeTab}-${key}`}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {label}
            </Typography>
            <Box
              sx={{
                border: `1px solid ${muiTheme.palette.divider}`,
                borderRadius: 1,
                mt: 1,
                p: 1,
              }}
            >
              <Sketch
                color={toSketchColor(currentDraftColors[key])}
                onChange={(color) => {
                  const next = formatColorValue(color);
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          [activeTab]: {
                            ...prev[activeTab],
                            [key]: next,
                          },
                        }
                      : prev
                  );
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        Theme Manager
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {feedback && (
          <Alert
            severity={feedback.type}
            sx={{ mb: 2 }}
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
          </Alert>
        )}
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Manage presets, switch between them, or create brand new color palettes
          to match your workspace. Changes apply to the entire extension.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mb: 3 }}
        >
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => startEditing()}
          >
            Create Theme
          </Button>
          <Button
            startIcon={<FileUploadIcon />}
            variant="outlined"
            onClick={handleImportTheme}
          >
            Import Theme
          </Button>
        </Stack>
        <Stack spacing={1.5}>
          {themes.map((theme) => {
            const isDefault = theme.id === defaultThemeDefinition.id;
            const isActive = theme.id === currentThemeId;
            return (
              <Box
                key={theme.id}
                sx={{
                  border: `1px solid ${muiTheme.palette.divider}`,
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle1">{theme.name}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {isDefault ? "Default preset" : "Custom preset"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant={isActive ? "contained" : "outlined"}
                    onClick={() => selectTheme(theme.id)}
                    disabled={isActive}
                  >
                    {isActive ? "Active" : "Apply"}
                  </Button>
                  <Tooltip title="Export">
                    <IconButton onClick={() => handleExportTheme(theme)}>
                      <FileDownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <span>
                      <IconButton
                        disabled={isDefault}
                        onClick={() => startEditing(theme)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <span>
                      <IconButton
                        disabled={isDefault}
                        onClick={() => deleteTheme(theme.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>
            );
          })}
        </Stack>
        {draft && (
          <Box
            mt={3}
            sx={{
              border: `1px solid ${muiTheme.palette.divider}`,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
              <TextField
                label="Theme name"
                fullWidth
                value={draft.name}
                onChange={(event) =>
                  setDraft((prev) =>
                    prev ? { ...prev, name: event.target.value } : prev
                  )
                }
              />
            </Stack>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 2 }}
            >
              <Tab label="Light" value="light" />
              <Tab label="Dark" value="dark" />
            </Tabs>
            {renderColorEditors()}
            <Stack direction="row" spacing={1} mt={3}>
              <Button variant="contained" onClick={handleSaveDraft}>
                Save Theme
              </Button>
              <Button variant="text" onClick={resetDraft}>
                Cancel
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThemeManagerDialog;
