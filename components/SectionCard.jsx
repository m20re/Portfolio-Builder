// components/SectionCard.jsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import RichTextEditor from "./RichTextEditor";

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
  onDuplicateSection,
  onDeleteSection,
  onToggleArchive,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const open = Boolean(anchorEl);
  const isArchived = section.archived;

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

  const handleClickDuplicate = () => {
    onDuplicateSection(section.id);
    handleCloseMenu();
  };

  const handleClickArchive = () => {
    onToggleArchive(section.id);
    handleCloseMenu();
  };

  const handleClickDelete = () => {
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteSection(section.id);
    setDeleteDialogOpen(false);
  };

  // When editor saves, update section content
  const handleRichContentChange = (html) => {
    onUpdateSection(section.id, { content: html });
  };

  // For uploads: update section.images and return URL so editor can insert
  const handleImageUpload = (file) => {
    const url = URL.createObjectURL(file);
    const images = [...(section.images || []), { id: Date.now(), url }];
    onUpdateSection(section.id, { images });
    return url; // used by RichTextEditor to insert <img>
  };

  return (
    <Paper
      sx={{
        position: "relative",
        width: section.width,
        minWidth: 300,
        minHeight: 150,
        p: 2,
        pt: 5,
        resize: "both",
        overflow: "auto",
        boxSizing: "border-box",
        flex: "0 0 auto",
        opacity: isArchived ? 0.6 : 1,
        borderStyle: isArchived ? "dashed" : "solid",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.2)",
      }}
      onMouseUp={(e) => onSizeCommit(section.id, e)}
    >
      {/* Top-right Options button */}
      <Box
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
          <MenuItem onClick={handleClickDuplicate} disableRipple>
            <FileCopyIcon />
            Duplicate
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleClickArchive} disableRipple>
            {isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
            {isArchived ? "Unarchive" : "Archive"}
          </MenuItem>
          <MenuItem onClick={handleClickDelete} disableRipple>
            <DeleteIcon />
            Delete
          </MenuItem>
        </StyledMenu>
      </Box>

      {/* Delete confirm dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete section?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{section.title}</strong>?
            This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>No</Button>
          <Button color="error" onClick={handleConfirmDelete} autoFocus>
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Title + archived chip */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {section.title}
        </Typography>
        {isArchived && <Chip label="Archived" size="small" />}
      </Box>

      {/* Content area */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {isEditing ? (
          <RichTextEditor
            initialValue={section.content || ""}
            onChange={handleRichContentChange}
            onDone={() => setIsEditing(false)}
            onImageUpload={handleImageUpload}
          />
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
