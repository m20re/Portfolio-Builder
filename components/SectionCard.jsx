"use client";

import * as React from "react";
import {
  Paper,
  Typography,
  Menu,
  Button,
  MenuItem,
  Divider,
  Box,
  IconButton,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

export default function SectionCard({
  section,
  onSizeCommit,
  onUpdateSection,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const editorRef = React.useRef(null);
  const open = Boolean(anchorEl);

  const [draftContent, setDraftContent] = React.useState(section.content);

  React.useEffect(() => {
    if (isEditing) {
      setDraftContent(section.content || "");
      if (editorRef.current) {
        editorRef.current.innerHTML = section.content || "";
      }
    }
  }, [isEditing]);

  const handleClickMenuButton = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClickEdit = () => {
    setIsEditing(true);
    handleCloseMenu();
  };

  // 🔹 Sync editor DOM with section.content whenever we enter edit mode
  React.useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = section.content || "";
    }
  }, [isEditing, section.content]);

  // basic formatting using document.execCommand
  const applyCommand = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onUpdateSection(section.id, { content: html });
    }
  };

  const handleContentInput = () => {
    if (editorRef.current) {
      setDraftContent(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    const images = [...(section.images || []), { id: Date.now(), url }];
    onUpdateSection(section.id, { images });
  };

  const handleDoneEditing = () => {
    onUpdateSection(section.id, { content: draftContent });
    setIsEditing(false);
  };

  return (
    <Paper
      sx={{
        position: "relative",
        width: section.width,
        height: section.height,
        minWidth: 300,
        minHeight: 150,
        p: 2,
        pt: 5,
        resize: "both",
        overflow: "auto",
        boxSizing: "border-box",
        flex: "0 0 auto",
      }}
      onMouseUp={(e) => onSizeCommit(section.id, e)}
    >
      {/* Top-right Options button */}
      {!isEditing && <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
        }}
      >
        <Button
          id={`section-${section.id}-options-button`}
          aria-controls={open ? `section-${section.id}-menu` : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          variant="text"
          size="small"
          disableElevation
          onClick={handleClickMenuButton}
          endIcon={<KeyboardArrowDownIcon />}
        >
          Options
        </Button>
        <StyledMenu
          id={`section-${section.id}-menu`}
          slotProps={{
            list: {
              "aria-labelledby": `section-${section.id}-options-button`,
            },
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleClickEdit} disableRipple>
            <EditIcon />
            Edit
          </MenuItem>
          <MenuItem onClick={handleCloseMenu} disableRipple>
            <FileCopyIcon />
            Duplicate
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleCloseMenu} disableRipple>
            <ArchiveIcon />
            Archive
          </MenuItem>
          <MenuItem onClick={handleCloseMenu} disableRipple>
            <MoreHorizIcon />
            More
          </MenuItem>
        </StyledMenu>
      </Box>}

      {/* Title */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {section.title}
      </Typography>

      {/* Content area */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {isEditing ? (
          <>
            {/* Toolbar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
              }}
            >
              <IconButton size="small" onClick={() => applyCommand("bold")}>
                <FormatBoldIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => applyCommand("italic")}>
                <FormatItalicIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => applyCommand("underline")}
              >
                <FormatUnderlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => applyCommand("insertUnorderedList")}
              >
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>

              <Button
                variant="outlined"
                size="small"
                component="label"
                sx={{ ml: "auto" }}
              >
                Upload image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>

            {/* Editable content area */}
            <Box
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleContentInput}
              sx={{
                border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: 1,
                p: 1,
                minHeight: 80,
                fontSize: 14,
                "&:focus": {
                  outline: "2px solid #3b82f6",
                },
              }}
            />

            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleDoneEditing}
              >
                Done
              </Button>
            </Box>
          </>
        ) : (
          <>
            {section.content ? (
              <Box
                sx={{
                  "& p": { margin: 0, marginBottom: "0.35rem" },
                  "& ul": { paddingLeft: "1.2rem", margin: 0 },
                  "& li": { marginBottom: "0.1rem" },
                }}
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Resizable content area for {section.title}. Click Options → Edit
                to add rich text and images.
              </Typography>
            )}

            {section.images?.length > 0 && (
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {section.images.map((img) => (
                  <Box
                    key={img.id}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.15)",
                    }}
                  >
                    <img
                      src={img.url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
