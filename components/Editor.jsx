"use client";

import { useNavItems } from "./NavItemsContext";
import { Box, Button, TextField,Stack,Slider,ToggleButton,ToggleButtonGroup } from "@mui/material";


import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Text, Transformer } from "react-konva";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

// Small helper component to attach Konva.Transformer to the selected node
function SelectionTransformer({ selectedId }) {
  const transformerRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!selectedId) return;
    const stage = transformerRef.current.getStage();
    const selectedNode = stage.findOne(`#node-${selectedId}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  return (
    <Layer ref={layerRef}>
      <Transformer
        ref={transformerRef}
        rotateEnabled={true}
        enabledAnchors={[
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
        ]}
        boundBoxFunc={(oldBox, newBox) => {
          // limit resize to avoid inverted shapes
          if (newBox.width < 20 || newBox.height < 20) {
            return oldBox;
          }
          return newBox;
        }}
      />
    </Layer>
  );
}
export default function Editor({sectionKey}) {
    const [elements, setElements] = useState([
    {
      id: "title",
      type: "text",
      x: 80,
      y: 60,
      text: "Your Name",
      fontSize: 28,
      fill: "#111827",
    },
    {
      id: "subtitle",
      type: "text",
      x: 80,
      y: 110,
      text: "Software Engineer",
      fontSize: 18,
      fill: "#4b5563",
    },
    {
      id: "box1",
      type: "rect",
      x: 70,
      y: 180,
      width: 220,
      height: 100,
      fill: "#3b82f6",
    },
  ]);

  const [selectedId, setSelectedId] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("#f9fafb");

  const selected = elements.find((el) => el.id === selectedId) || null;

  const addRectangle = () => {
    const id = `rect-${Date.now()}`;
    setElements((prev) => [
      ...prev,
      {
        id,
        type: "rect",
        x: 120,
        y: 140,
        width: 160,
        height: 80,
        fill: "#22c55e",
      },
    ]);
    setSelectedId(id);
  };

  const addText = () => {
    const id = `text-${Date.now()}`;
    setElements((prev) => [
      ...prev,
      {
        id,
        type: "text",
        x: 140,
        y: 160,
        text: "New text",
        fontSize: 18,
        fill: "#111827",
      },
    ]);
    setSelectedId(id);
  };

  const handleDragEnd = (id, e) => {
    const { x, y } = e.target.position();
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

  const handleResize = (id, newAttrs) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...newAttrs } : el))
    );
  };

  const handleCanvasClick = (e) => {
    // deselect if clicked on empty area
    const clickedEmpty = e.target === e.target.getStage();
    if (clickedEmpty) setSelectedId(null);
  };

  const updateSelected = (field, value) => {
    if (!selected) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selected.id ? { ...el, [field]: value } : el
      )
    );
  };

  const handleSaveLayout = () => {
    // This JSON is what you send to your backend / AWS RDS
    const layout = {
      backgroundColor,
      elements,
    };
    console.log("Layout JSON:", layout);
    alert("In a real app, send this JSON to your API:\n\n" + JSON.stringify(layout, null, 2));
  };



  const { navItems, updateLabel } = useNavItems();

  // Find the nav item for this sectionKey (slug)
  const currentItem = navItems.find((item) => item.slug === sectionKey);
  const currentLabel = currentItem?.label || sectionKey;

  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(currentLabel);

  // Keep draftLabel in sync if navItems change
  useEffect(() => {
    setDraftLabel(currentLabel);
  }, [currentLabel]);

  const handleSave = () => {
    updateLabel(sectionKey, draftLabel.trim() || currentLabel);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftLabel(currentLabel);
    setIsEditing(false);
  };

  return (
    <div>
      {/* Title row */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {!isEditing ? (
          <>
            <h2 className="text-xl font-semibold">
              This is <span className="font-bold">{currentLabel}</span> page
            </h2>
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
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Box>

         <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.5fr) 320px",
        gap: 2,
        height: "100%",
      }}
    >
      {/* Left: Canvas + toolbar */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Top toolbar */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" size="small" onClick={addRectangle}>
            + Rectangle
          </Button>
          <Button variant="outlined" size="small" onClick={addText}>
            + Text
          </Button>
          <Button size="small" onClick={handleSaveLayout}>
            Save Layout
          </Button>
        </Stack>

        {/* Canvas */}
        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            backgroundColor: "#e5e7eb",
            p: 1,
            width: "100%",
          }}
        >
          <Stage
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ background: backgroundColor }}
            onMouseDown={handleCanvasClick}
            onTouchStart={handleCanvasClick}
          >
            <Layer>
              {elements.map((el) => {
                const isSelected = el.id === selectedId;

                if (el.type === "rect") {
                  return (
                    <Rect
                      key={el.id}
                      id={`node-${el.id}`}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      fill={el.fill}
                      draggable
                      onClick={() => setSelectedId(el.id)}
                      onTap={() => setSelectedId(el.id)}
                      onDragEnd={(e) => handleDragEnd(el.id, e)}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        node.scaleX(1);
                        node.scaleY(1);
                        handleResize(el.id, {
                          x: node.x(),
                          y: node.y(),
                          width: Math.max(20, node.width() * scaleX),
                          height: Math.max(20, node.height() * scaleY),
                        });
                      }}
                    />
                  );
                }

                if (el.type === "text") {
                  return (
                    <Text
                      key={el.id}
                      id={`node-${el.id}`}
                      x={el.x}
                      y={el.y}
                      text={el.text}
                      fontSize={el.fontSize}
                      fill={el.fill}
                      draggable
                      onClick={() => setSelectedId(el.id)}
                      onTap={() => setSelectedId(el.id)}
                      onDragEnd={(e) => handleDragEnd(el.id, e)}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleY = node.scaleY();
                        node.scaleY(1);
                        handleResize(el.id, {
                          x: node.x(),
                          y: node.y(),
                          fontSize: Math.max(10, el.fontSize * scaleY),
                        });
                      }}
                    />
                  );
                }

                return null;
              })}
            </Layer>

            {/* Transformer for selected element */}
            {selectedId && <SelectionTransformer selectedId={selectedId} />}
          </Stage>
        </Box>
      </Box>

      {/* Right: Sidebar controls */}
      <Box
        sx={{
          borderRadius: 2,
          border: "1px solid #e5e7eb",
          p: 2,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 4 }}>
          Sidebar Controls
        </h2>

        {/* Canvas background */}
        <Box>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Canvas background</div>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            style={{ width: "100%", height: 32, borderRadius: 6, border: "1px solid #e5e7eb" }}
          />
        </Box>

        {/* Selected element properties */}
        {selected ? (
          <>
            <Box sx={{ mt: 1 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Selected type</div>
              <ToggleButtonGroup
                size="small"
                value={selected.type}
                exclusive
                sx={{ mb: 1 }}
              >
                <ToggleButton value="text">Text</ToggleButton>
                <ToggleButton value="rect">Shape</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {selected.type === "text" && (
              <>
                <TextField
                  label="Text"
                  size="small"
                  fullWidth
                  value={selected.text}
                  onChange={(e) => updateSelected("text", e.target.value)}
                />

                <Box>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Font size</div>
                  <Slider
                    size="small"
                    min={10}
                    max={48}
                    value={selected.fontSize || 16}
                    onChange={(_, value) => updateSelected("fontSize", value)}
                  />
                </Box>
              </>
            )}

            <Box>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Color</div>
              <input
                type="color"
                value={selected.fill}
                onChange={(e) => updateSelected("fill", e.target.value)}
                style={{ width: "100%", height: 32, borderRadius: 6, border: "1px solid #e5e7eb" }}
              />
            </Box>

            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => {
                setElements((prev) => prev.filter((el) => el.id !== selected.id));
                setSelectedId(null);
              }}
            >
              Delete element
            </Button>
          </>
        ) : (
          <p style={{ fontSize: 12, color: "#6b7280" }}>
            Click on a shape or text on the canvas to edit it here.
          </p>
        )}
      </Box>
    </Box>

      <div>
        {/* For now just show the section key */}
        <p>Section key (slug): {sectionKey}</p>
      </div>
    </div>
  );
}