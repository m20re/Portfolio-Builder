// components/RichTextEditor.jsx
"use client";

import * as React from "react";
import { Box, Button, IconButton } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Menu from "@mui/material/Menu";

export default function RichTextEditor({
  initialValue,
  onChange, // called with final HTML when user clicks Done
  onDone, // called after save to close editor
  onImageUpload, // (optional) file => url, parent can store images
}) {
  const [draftContent, setDraftContent] = React.useState(initialValue || "");
  const editorRef = React.useRef(null);

  const [anchorTextColor, setAnchorTextColor] = React.useState(null);
  const [anchorHighlight, setAnchorHighlight] = React.useState(null);

  const openTextColor = Boolean(anchorTextColor);
  const openHighlight = Boolean(anchorHighlight);

  // Sync editor when initialValue changes (when opening editor / switching section)
  React.useEffect(() => {
    const html = initialValue || "";
    setDraftContent(html);
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
  }, [initialValue]);

  // Helper: sync local draft from DOM
  const updateDraftFromDom = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setDraftContent(html);
    }
  };

  // Apply execCommand with optional value
  const applyCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    updateDraftFromDom();
  };

  // Insert raw HTML at caret
  const insertHtml = (html) => {
    document.execCommand("insertHTML", false, html);
    updateDraftFromDom();
  };

  const handleContentInput = () => {
    updateDraftFromDom();
  };

  // Upload button → let parent store image (for gallery) and get URL, then insert inline
  const handleUploadClick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let url = null;
    if (onImageUpload) {
      // parent can also push this into section.images and return the URL
      url = onImageUpload(file);
    } else {
      url = URL.createObjectURL(file);
    }
    if (!url) return;

    insertHtml(
      `<img src="${url}" style="max-width: 100%; border-radius: 4px; margin-top: 4px;" />`
    );
  };

  // Add a link
  const handleAddLink = () => {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    applyCommand("createLink", url);
  };

  // Insert a simple code block
  const handleInsertCodeBlock = () => {
    insertHtml("<pre><code>// your code here</code></pre>");
  };

  // Insert a blockquote
  const handleInsertBlockquote = () => {
    applyCommand("formatBlock", "<blockquote>");
  };

  // Insert a simple 2x2 table
  const handleInsertTable = () => {
    const tableHtml = `
      <table border="1" style="border-collapse: collapse; width: 100%; margin-top: 4px;">
        <tr>
          <td style="padding:4px;">Cell 1</td>
          <td style="padding:4px;">Cell 2</td>
        </tr>
        <tr>
          <td style="padding:4px;">Cell 3</td>
          <td style="padding:4px;">Cell 4</td>
        </tr>
      </table>
    `;
    insertHtml(tableHtml);
  };

  // Insert emoji
  const handleInsertEmoji = (emoji) => {
    insertHtml(emoji);
  };

  // Drag-and-drop image into editor
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    let url = null;
    if (onImageUpload) {
      url = onImageUpload(file);
    } else {
      url = URL.createObjectURL(file);
    }
    if (!url) return;

    insertHtml(
      `<img src="${url}" style="max-width: 100%; border-radius: 4px; margin-top: 4px;" />`
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDone = () => {
    if (onChange) {
      onChange(draftContent);
    }
    if (onDone) {
      onDone();
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          mb: 1,
        }}
      >
        {/* Bold / Italic / Underline / List */}
        <IconButton size="small" onClick={() => applyCommand("bold")}>
          <FormatBoldIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" onClick={() => applyCommand("italic")}>
          <FormatItalicIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" onClick={() => applyCommand("underline")}>
          <FormatUnderlinedIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => applyCommand("insertUnorderedList")}
        >
          <FormatListBulletedIcon fontSize="small" />
        </IconButton>

        <select
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return;
            applyCommand("formatBlock", `<${value}>`);
          }}
          defaultValue=""
          style={{ padding: "4px", borderRadius: 4, fontSize: 12 }}
        >
          <option value="" disabled>
            Heading
          </option>
          <option value="p">Normal</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>

        {/* Font family */}
        <select
          onChange={(e) => applyCommand("fontName", e.target.value)}
          defaultValue=""
          style={{ padding: "4px", borderRadius: 4, fontSize: 12 }}
        >
          <option value="" disabled>
            Font
          </option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Courier New">Courier New</option>
        </select>

        {/* Font size */}
        <select
          onChange={(e) => applyCommand("fontSize", e.target.value)}
          defaultValue=""
          style={{ padding: "4px", borderRadius: 4, fontSize: 12 }}
        >
          <option value="" disabled>
            Size
          </option>
          <option value="1">10px</option>
          <option value="2">13px</option>
          <option value="3">16px</option>
          <option value="4">18px</option>
          <option value="5">24px</option>
          <option value="6">32px</option>
          <option value="7">48px</option>
        </select>

        {/* TEXT COLOR BUTTON */}
        <IconButton
          size="small"
          onClick={(e) => setAnchorTextColor(e.currentTarget)}
          title="Text color"
        >
          <FormatColorTextIcon fontSize="small" />
          <ArrowDropDownIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={anchorTextColor}
          open={openTextColor}
          onClose={() => setAnchorTextColor(null)}
          sx={{ padding: 1 }}
        >
          <Box sx={{ display: "flex", p: 1, gap: 1 }}>
            <input
              type="color"
              onChange={(e) => {
                applyCommand("foreColor", e.target.value);
                setAnchorTextColor(null);
              }}
              style={{
                width: 32,
                height: 32,
                padding: 0,
                border: "none",
                background: "transparent",
              }}
            />
          </Box>
        </Menu>

        {/* HIGHLIGHT BUTTON */}
        <IconButton
          size="small"
          onClick={(e) => setAnchorHighlight(e.currentTarget)}
          title="Highlight color"
        >
          <BorderColorIcon fontSize="small" />
          <ArrowDropDownIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={anchorHighlight}
          open={openHighlight}
          onClose={() => setAnchorHighlight(null)}
        >
          <Box sx={{ display: "flex", p: 1, gap: 1 }}>
            <input
              type="color"
              onChange={(e) => {
                applyCommand("hiliteColor", e.target.value);
                setAnchorHighlight(null);
              }}
              style={{
                width: 32,
                height: 32,
                padding: 0,
                border: "none",
                background: "transparent",
              }}
            />
          </Box>
        </Menu>

        {/* Alignment with icons */}
        <IconButton
          size="small"
          onClick={() => applyCommand("justifyLeft")}
          title="Align left"
        >
          <FormatAlignLeftIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => applyCommand("justifyCenter")}
          title="Align center"
        >
          <FormatAlignCenterIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => applyCommand("justifyRight")}
          title="Align right"
        >
          <FormatAlignRightIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => applyCommand("justifyFull")}
          title="Justify"
        >
          <FormatAlignJustifyIcon fontSize="small" />
        </IconButton>

        {/* Subscript / Superscript */}
        <Button
          size="small"
          variant="text"
          onClick={() => applyCommand("subscript")}
        >
          X<sub style={{ fontSize: 10 }}>2</sub>
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={() => applyCommand("superscript")}
        >
          X<sup style={{ fontSize: 10 }}>2</sup>
        </Button>

        {/* Blockquote / Code block */}
        <Button
          size="small"
          variant="outlined"
          onClick={handleInsertBlockquote}
        >
          ❝
        </Button>
        <Button size="small" variant="outlined" onClick={handleInsertCodeBlock}>
          {"</>"}
        </Button>

        {/* Link */}
        <Button size="small" variant="text" onClick={handleAddLink}>
          Link
        </Button>

        {/* Table */}
        <Button size="small" variant="text" onClick={handleInsertTable}>
          Table
        </Button>

        {/* Emoji */}
        <Button
          size="small"
          variant="text"
          onClick={() => handleInsertEmoji("😊")}
        >
          😊
        </Button>

        {/* Image upload */}
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
            onChange={handleUploadClick}
          />
        </Button>
      </Box>

      {/* Editable content area */}
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
        <Button variant="contained" size="small" onClick={handleDone}>
          Done
        </Button>
      </Box>
    </Box>
  );
}
