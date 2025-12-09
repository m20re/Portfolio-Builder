"use client";

import { useState, useEffect } from "react";
import { Box, Button, TextField, CircularProgress, Alert, Chip } from "@mui/material";
import { portfolioAPI, sectionAPI } from "../lib/api.js";
import SectionsBoard from "./SectionsBoard";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

export default function EditorWithBackend({ portfolioId }) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  // Load portfolio and sections
  useEffect(() => {
    if (portfolioId) {
      loadData();
    }
  }, [portfolioId]);

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);

      // Load portfolio details
      const portfolioResponse = await portfolioAPI.getById(portfolioId);
      setPortfolio(portfolioResponse.portfolio);
      setDraftTitle(portfolioResponse.portfolio.title);

      // Load sections
      const sectionsResponse = await sectionAPI.getAll(portfolioId, true);

      // Transform backend sections to match your local format
      const transformedSections = sectionsResponse.sections.map(sec => ({
        id: sec.id,
        title: sec.title || "Untitled Section",
        width: 600,
        height: 250,
        content: typeof sec.content === 'string' ? sec.content : sec.content?.html || "",
        images: sec.content?.images || [],
        archived: !sec.isVisible,
        type: sec.type,
        order: sec.order,
      }));

      setSections(transformedSections);
    } catch (err) {
      setError("Failed to load portfolio: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Save title to backend
  const handleTitleSave = async () => {
    try {
      setSaving(true);
      await portfolioAPI.update(portfolioId, { title: draftTitle });
      setPortfolio({ ...portfolio, title: draftTitle });
      setIsEditingTitle(false);
    } catch (err) {
      setError("Failed to update title: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleCancel = () => {
    setDraftTitle(portfolio.title);
    setIsEditingTitle(false);
  };

  // Add section (save to backend)
  const handleAddSection = async () => {
    const nextIndex = sections.length + 1;
    const newSectionData = {
      type: "custom",
      title: `Section ${nextIndex}`,
      content: {
        html: "",
        images: [],
      },
      order: nextIndex,
      isVisible: true,
    };

    try {
      setSaving(true);
      const response = await sectionAPI.create(portfolioId, newSectionData);

      // Transform and add to local state
      const newSection = {
        id: response.section.id,
        title: response.section.title,
        width: 600,
        height: 250,
        content: "",
        images: [],
        archived: false,
        type: response.section.type,
        order: response.section.order,
      };

      setSections([...sections, newSection]);
    } catch (err) {
      setError("Failed to create section: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update section (save to backend)
  const handleUpdateSection = async (id, changes) => {
    // Update local state immediately for responsiveness
    const updatedSections = sections.map((sec) =>
      sec.id === id ? { ...sec, ...changes } : sec
    );
    setSections(updatedSections);

    // Prepare backend update
    const backendUpdate = {};

    if (changes.title !== undefined) backendUpdate.title = changes.title;
    if (changes.content !== undefined || changes.images !== undefined) {
      const section = sections.find(s => s.id === id);
      backendUpdate.content = {
        html: changes.content !== undefined ? changes.content : section.content,
        images: changes.images !== undefined ? changes.images : section.images,
      };
    }
    if (changes.archived !== undefined) backendUpdate.isVisible = !changes.archived;

    try {
      await sectionAPI.update(id, backendUpdate);
    } catch (err) {
      setError("Failed to update section: " + err.message);
      // Revert local changes on error
      loadData();
    }
  };

  // Handle image upload - convert to base64 and save
  const handleImageUpload = (file, sectionId) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64Image = e.target.result;
        
        // Get current section
        const section = sections.find(s => s.id === sectionId);
        if (!section) {
          reject(new Error('Section not found'));
          return;
        }
        
        // Add to section's images array
        const newImages = [...(section.images || []), { 
          id: Date.now(), 
          url: base64Image,
          name: file.name 
        }];
        
        // Update section with new image
        handleUpdateSection(sectionId, { images: newImages });
        
        // Return the base64 URL for insertion in editor
        resolve(base64Image);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleSizeCommit = (id, e) => {
    const el = e.currentTarget;
    const newWidth = el.offsetWidth;
    const newHeight = el.offsetHeight;

    // Update local state only (size is not saved to backend)
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, width: newWidth, height: newHeight } : sec
    );
    setSections(updated);
  };

  // Duplicate section (create copy in backend)
  const handleDuplicateSection = async (id) => {
    const original = sections.find(sec => sec.id === id);
    if (!original) return;

    const duplicateData = {
      type: original.type,
      title: `${original.title} (copy)`,
      content: {
        html: original.content,
        images: original.images,
      },
      order: original.order + 1,
      isVisible: !original.archived,
    };

    try {
      setSaving(true);
      const response = await sectionAPI.create(portfolioId, duplicateData);

      // Add to local state
      const newSection = {
        id: response.section.id,
        title: response.section.title,
        width: original.width,
        height: original.height,
        content: original.content,
        images: original.images,
        archived: false,
        type: response.section.type,
        order: response.section.order,
      };

      // Insert after original
      const idx = sections.findIndex(sec => sec.id === id);
      const updated = [...sections];
      updated.splice(idx + 1, 0, newSection);
      setSections(updated);
    } catch (err) {
      setError("Failed to duplicate section: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete section (remove from backend)
  const handleDeleteSection = async (id) => {
    try {
      setSaving(true);
      await sectionAPI.delete(id);
      setSections(sections.filter((sec) => sec.id !== id));
    } catch (err) {
      setError("Failed to delete section: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle archive (update isVisible in backend)
  const handleToggleArchive = async (id) => {
    const section = sections.find(sec => sec.id === id);
    if (!section) return;

    try {
      await sectionAPI.update(id, { isVisible: section.archived });

      // Update local state
      setSections(sections.map(sec =>
        sec.id === id ? { ...sec, archived: !sec.archived } : sec
      ));
    } catch (err) {
      setError("Failed to toggle archive: " + err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!portfolio) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Portfolio not found</Alert>
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
        {portfolio.isPublished && (
          <Chip label="Published" color="success" size="small" />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Title row */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        {!isEditingTitle ? (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsEditingTitle(true)}
            >
              Edit title
            </Button>
          </>
        ) : (
          <>
            <TextField
              size="small"
              label="Portfolio title"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleTitleSave}
                disabled={saving}
              >
                {saving ? <CircularProgress size={20} /> : "Save"}
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
        onImageUpload={handleImageUpload}
      />

      {saving && (
        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <Chip
            label="Saving..."
            color="primary"
            icon={<CircularProgress size={16} />}
          />
        </Box>
      )}
    </div>
  );
}
