"use client";

import { useState, useEffect } from "react";
import { useNavItems } from "./NavItemsContext";
import { Box, Button, TextField } from "@mui/material";
import SectionsBoard from "./SectionsBoard";

export default function Editor({ sectionKey }) {
  const { navItems, updateLabel } = useNavItems();

  // Find current nav item by slug
  const currentItem = navItems.find((item) => item.slug === sectionKey);
  const currentLabel = currentItem?.label || sectionKey;

  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(currentLabel);

  // Sections inside this page
  const [sections, setSections] = useState([
    {
      id: "section-1",
      title: "Section 1",
      width: 600,
      height: 250,
      content: "<p>Hello world</p>", // 👈 This will show up in the editor & view
      images: [],
    },
  ]);

  // keep draftLabel in sync if nav item label changes
  useEffect(() => {
    setDraftLabel(currentLabel);
  }, [currentLabel]);

  const handleTitleSave = () => {
    updateLabel(sectionKey, draftLabel.trim() || currentLabel);
    console.log("Updated label for", sectionKey, "to", draftLabel);
    setIsEditing(false);
  };

  const handleTitleCancel = () => {
    setDraftLabel(currentLabel);
    setIsEditing(false);
  };

  const handleAddSection = () => {
    const nextIndex = sections.length + 1;
    const newSection = {
      id: `section-${Date.now()}`, // unique
      title: `Section ${nextIndex}`,
      width: 600,
      height: 250,
      content: "",
      images: [],
      archived: false, // 🔹
    };
    const updated = [...sections, newSection];
    setSections(updated);
    console.log("Sections after add:", updated);
  };

  const handleUpdateSection = (id, changes) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, ...changes } : sec
    );
    setSections(updated);
    console.log("Sections after update:", updated);
  };

  const handleSizeCommit = (id, e) => {
    const el = e.currentTarget;
    const newWidth = el.offsetWidth;
    const newHeight = el.offsetHeight;

    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, width: newWidth, height: newHeight } : sec
    );
    setSections(updated);
    console.log("Sections after resize:", updated);
  };

  // Duplicate: clone section and insert right below it
  const handleDuplicateSection = (id) => {
    setSections((prev) => {
      const idx = prev.findIndex((sec) => sec.id === id);
      if (idx === -1) return prev;

      const original = prev[idx];
      const copy = {
        ...original,
        id: `section-${Date.now()}`, // new id
        title: `${original.title} (copy)`,
        archived: false,
      };

      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      console.log("Sections after duplicate:", next);
      return next;
    });
  };

  // Delete: remove section by id
  const handleDeleteSection = (id) => {
    setSections((prev) => prev.filter((sec) => sec.id !== id));
  };

  // Archive toggle: flip archived boolean
  const handleToggleArchive = (id) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, archived: !sec.archived } : sec
      )
    );
  };

  return (
    <div>
      {/* Title row (top) */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {!isEditing ? (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsEditing(true)}
            >
              Edit title
            </Button>
          </>
        ) : (
          <>
            <TextField
              size="small"
              label="Section title"
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleTitleSave}
              >
                Save
              </Button>
              <Button variant="text" size="small" onClick={handleTitleCancel}>
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* Sections board */}
      <SectionsBoard
        sections={sections}
        onSizeCommit={handleSizeCommit}
        onAddSection={handleAddSection}
        onUpdateSection={handleUpdateSection}
        onDuplicateSection={handleDuplicateSection}
        onDeleteSection={handleDeleteSection}
        onToggleArchive={handleToggleArchive}
      />
    </div>
  );
}
