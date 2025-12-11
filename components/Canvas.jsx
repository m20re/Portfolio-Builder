"use client";

import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Text, Transformer, Circle, RegularPolygon } from "react-konva";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import jsPDF from "jspdf";

const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 450;

// Define themes
const themes = {
  light: {
    backgroundType: "color",
    backgroundColor: "#f9fafb",
    gradientColors: { start: "#f9fafb", end: "#e5e7eb" },
    gradientAngle: 0,
    defaultTextColor: "#111827",
    defaultShapeColor: "#3b82f6",
  },
  dark: {
    backgroundType: "color",
    backgroundColor: "#111827",
    gradientColors: { start: "#1f2937", end: "#374151" },
    gradientAngle: 0,
    defaultTextColor: "#f9fafb",
    defaultShapeColor: "#6366f1",
  },
  sunset: {
    backgroundType: "gradient",
    backgroundColor: "#fbbf24",
    gradientColors: { start: "#fbbf24", end: "#f97316" },
    gradientAngle: 45,
    defaultTextColor: "#ffffff",
    defaultShapeColor: "#ef4444",
  },
};

function SelectionTransformer({ selectedId }) {
  const transformerRef = useRef(null);

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
    <Layer>
      <Transformer
        ref={transformerRef}
        rotateEnabled={true}
        enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
        boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
      />
    </Layer>
  );
}

export default function Editor() {
  const stageRef = useRef(null);

  const [elements, setElements] = useState([
    { id: "title", type: "text", x: 80, y: 60, text: "Your Name", fontSize: 28, fill: "#111827" },
    { id: "subtitle", type: "text", x: 80, y: 110, text: "Software Engineer", fontSize: 18, fill: "#4b5563" },
    { id: "box1", type: "rect", x: 70, y: 180, width: 220, height: 100, fill: "#3b82f6" },
  ]);

  const [selectedId, setSelectedId] = useState(null);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [mode, setMode] = useState("theme"); // "theme" or "customize"
  const [backgroundType, setBackgroundType] = useState(themes.light.backgroundType);
  const [backgroundColor, setBackgroundColor] = useState(themes.light.backgroundColor);
  const [gradientColors, setGradientColors] = useState(themes.light.gradientColors);
  const [gradientAngle, setGradientAngle] = useState(themes.light.gradientAngle);
  const [canvasSize, setCanvasSize] = useState({ width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT });
  const [shapeType, setShapeType] = useState("rect");

  const selected = elements.find((el) => el.id === selectedId) || null;

  const addShape = () => {
    const id = `${shapeType}-${Date.now()}`;
    let newShape;
    switch (shapeType) {
      case "rect":
        newShape = { id, type: "rect", x: 120, y: 140, width: 160, height: 80, fill: themes[currentTheme].defaultShapeColor };
        break;
      case "circle":
        newShape = { id, type: "circle", x: 200, y: 200, radius: 50, fill: themes[currentTheme].defaultShapeColor };
        break;
      case "triangle":
        newShape = { id, type: "triangle", x: 200, y: 200, radius: 60, fill: themes[currentTheme].defaultShapeColor };
        break;
      default:
        return;
    }
    setElements((prev) => [...prev, newShape]);
    setSelectedId(id);
  };

  const addText = () => {
    const id = `text-${Date.now()}`;
    setElements((prev) => [...prev, { id, type: "text", x: 140, y: 160, text: "New text", fontSize: 18, fill: themes[currentTheme].defaultTextColor }]);
    setSelectedId(id);
  };

  const handleDragEnd = (id, e) => {
    const { x, y } = e.target.position();
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, x, y } : el)));
  };

  const handleResize = (id, newAttrs) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...newAttrs } : el)));
  };

  const handleCanvasClick = (e) => {
    if (e.target === e.target.getStage()) setSelectedId(null);
  };

  const updateSelected = (field, value) => {
    if (!selected) return;
    setElements((prev) => prev.map((el) => (el.id === selected.id ? { ...el, [field]: value } : el)));
  };

  const handleSaveLayout = () => {
    const layout = { mode, currentTheme, backgroundType, backgroundColor, gradientColors, gradientAngle, canvasSize, elements };
    console.log("Layout JSON:", layout);
    alert("In a real app, send this JSON to your API:\n\n" + JSON.stringify(layout, null, 2));
  };

  const gradientStyle = () => `linear-gradient(${gradientAngle}deg, ${gradientColors.start}, ${gradientColors.end})`;

  const exportPDF = () => {
    if (!stageRef.current) return;

    // Use a higher pixel ratio for better quality
    const pixelRatio = 3;
    const stage = stageRef.current;

    // Create a temporary canvas with the exact dimensions
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = canvasSize.width * pixelRatio;
    tempCanvas.height = canvasSize.height * pixelRatio;

    // Fill background based on current settings
    if (backgroundType === "color") {
      tempCtx.fillStyle = backgroundColor;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    } else {
      // Create linear gradient
      const angleRad = (gradientAngle * Math.PI) / 180;
      const x2 = Math.cos(angleRad) * tempCanvas.width;
      const y2 = Math.sin(angleRad) * tempCanvas.height;

      const gradient = tempCtx.createLinearGradient(0, 0, x2, y2);
      gradient.addColorStop(0, gradientColors.start);
      gradient.addColorStop(1, gradientColors.end);

      tempCtx.fillStyle = gradient;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // Get the Konva canvas without background
    const konvaCanvas = stage.toCanvas({
      pixelRatio: pixelRatio,
      width: canvasSize.width * pixelRatio,
      height: canvasSize.height * pixelRatio,
      imageSmoothingEnabled: true,
    });

    // Draw Konva elements on top of the background
    tempCtx.drawImage(konvaCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

    // Convert to data URL
    const imgData = tempCanvas.toDataURL('image/png', 1.0);

    // Create PDF with proper dimensions
    const pdf = new jsPDF({
      orientation: canvasSize.width > canvasSize.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvasSize.width, canvasSize.height],
    });

    // Add image to PDF (scaled to fit)
    pdf.addImage(
      imgData,
      'PNG',
      0,
      0,
      canvasSize.width,
      canvasSize.height,
      undefined,
      'FAST'
    );

    // Save the PDF
    pdf.save(`canvas-export.pdf`);
  };

  const applyTheme = (themeName) => {
    if (mode !== "theme") return; // Only apply in theme mode
    const theme = themes[themeName];
    if (!theme) return;

    setCurrentTheme(themeName);
    setBackgroundType(theme.backgroundType);
    setBackgroundColor(theme.backgroundColor);
    setGradientColors(theme.gradientColors);
    setGradientAngle(theme.gradientAngle);

    setElements((prev) =>
      prev.map((el) => {
        if (el.type === "text") return { ...el, fill: theme.defaultTextColor };
        if (el.type === "rect" || el.type === "circle" || el.type === "triangle") return { ...el, fill: theme.defaultShapeColor };
        return el;
      })
    );
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) 450px", gap: 2, height: "100%" }}>
      {/* Canvas Area */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Select size="small" value={shapeType} onChange={(e) => setShapeType(e.target.value)}>
            <MenuItem value="rect">Rectangle</MenuItem>
            <MenuItem value="circle">Circle</MenuItem>
            <MenuItem value="triangle">Triangle</MenuItem>
          </Select>
          <Button variant="contained" size="small" onClick={addShape}>Add Shape</Button>
          <Button variant="outlined" size="small" onClick={addText}>Add Text</Button>
          <Button size="small" onClick={handleSaveLayout}>Save Layout</Button>
          <Button size="small" onClick={exportPDF}>Export PDF</Button>
        </Stack>

        <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", overflow: "hidden", backgroundColor: "#e5e7eb", p: 1, width: canvasSize.width, height: canvasSize.height }}>
          <Stage
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ background: backgroundType === "color" ? backgroundColor : gradientStyle() }}
            onMouseDown={handleCanvasClick}
            onTouchStart={handleCanvasClick}
            ref={stageRef}
          >
            <Layer>
              {elements.map(el => {
                switch (el.type) {
                  case "rect":
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
                        onClick={(e) => { e.cancelBubble = true; setSelectedId(el.id); }}
                        onDragEnd={(e) => handleDragEnd(el.id, e)}
                        onTransform={(e) => {
                          const node = e.target;
                          handleResize(el.id, { x: node.x(), y: node.y(), width: Math.max(20, node.width() * node.scaleX()), height: Math.max(20, node.height() * node.scaleY()) });
                          node.scaleX(1); node.scaleY(1);
                        }}
                      />
                    );
                  case "circle":
                    return (
                      <Circle
                        key={el.id}
                        id={`node-${el.id}`}
                        x={el.x}
                        y={el.y}
                        radius={el.radius}
                        fill={el.fill}
                        draggable
                        onClick={(e) => { e.cancelBubble = true; setSelectedId(el.id); }}
                        onDragEnd={(e) => handleDragEnd(el.id, e)}
                        onTransform={(e) => {
                          const node = e.target;
                          const scale = node.scaleX();
                          node.scaleX(1); node.scaleY(1);
                          handleResize(el.id, { x: node.x(), y: node.y(), radius: Math.max(10, el.radius * scale) });
                        }}
                      />
                    );
                  case "triangle":
                    return (
                      <RegularPolygon
                        key={el.id}
                        id={`node-${el.id}`}
                        x={el.x}
                        y={el.y}
                        sides={3}
                        radius={el.radius}
                        fill={el.fill}
                        draggable
                        onClick={(e) => { e.cancelBubble = true; setSelectedId(el.id); }}
                        onDragEnd={(e) => handleDragEnd(el.id, e)}
                        onTransform={(e) => {
                          const node = e.target;
                          const scale = node.scaleX();
                          node.scaleX(1); node.scaleY(1);
                          handleResize(el.id, { x: node.x(), y: node.y(), radius: Math.max(10, el.radius * scale) });
                        }}
                      />
                    );
                  case "text":
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
                        onClick={(e) => { e.cancelBubble = true; setSelectedId(el.id); }}
                        onDragEnd={(e) => handleDragEnd(el.id, e)}
                        onTransform={(e) => {
                          const node = e.target;
                          const scaleY = node.scaleY();
                          node.scaleY(1);
                          handleResize(el.id, { x: node.x(), y: node.y(), fontSize: Math.max(10, el.fontSize * scaleY) });
                        }}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </Layer>
            {selectedId && <SelectionTransformer selectedId={selectedId} />}
          </Stage>
        </Box>
      </Box>

      {/* Sidebar */}
      <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 3, backgroundColor: "white", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", maxHeight: "100%" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 4 }}>Sidebar Controls</h2>

        {/* Mode toggle */}
        <Box>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Mode</div>
          <ToggleButtonGroup size="small" value={mode} exclusive onChange={(_, value) => value && setMode(value)}>
            <ToggleButton value="theme">Theme</ToggleButton>
            <ToggleButton value="customize">Customize</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {mode === "theme" ? (
          <Box>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Theme</div>
            <Select size="small" value={currentTheme} onChange={(e) => applyTheme(e.target.value)} fullWidth>
              {Object.keys(themes).map(key => <MenuItem key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</MenuItem>)}
            </Select>
          </Box>
        ) : (
          <>
            <Box>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Background type</div>
              <ToggleButtonGroup size="small" value={backgroundType} exclusive onChange={(_, value) => value && setBackgroundType(value)}>
                <ToggleButton value="color">Color</ToggleButton>
                <ToggleButton value="gradient">Gradient</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {backgroundType === "color" ? (
              <Box>
                <div style={{ fontSize: 12, marginBottom: 4 }}>Canvas color</div>
                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} style={{ width: "100%", height: 32, borderRadius: 6, border: "1px solid #e5e7eb" }} />
              </Box>
            ) : (
              <>
                <Box>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Gradient start</div>
                  <input type="color" value={gradientColors.start} onChange={(e) => setGradientColors(prev => ({ ...prev, start: e.target.value }))} style={{ width: "100%", height: 32, borderRadius: 6, border: "1px solid #e5e7eb" }} />
                </Box>
                <Box>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Gradient end</div>
                  <input type="color" value={gradientColors.end} onChange={(e) => setGradientColors(prev => ({ ...prev, end: e.target.value }))} style={{ width: "100%", height: 32, borderRadius: 6, border: "1px solid #e5e7eb" }} />
                </Box>
                <Box>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Gradient angle</div>
                  <Slider size="small" min={0} max={360} value={gradientAngle} onChange={(_, value) => setGradientAngle(value)} />
                </Box>
              </>
            )}
          </>
        )}

        {/* Canvas size sliders */}
        <Box>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Canvas Width</div>
          <Slider size="small" min={200} max={1600} value={canvasSize.width} onChange={(_, value) => setCanvasSize(prev => ({ ...prev, width: value }))} />
        </Box>
        <Box>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Canvas Height</div>
          <Slider size="small" min={200} max={1000} value={canvasSize.height} onChange={(_, value) => setCanvasSize(prev => ({ ...prev, height: value }))} />
        </Box>

        {/* Selected element */}
        {selected ? (
          <>
            <Box sx={{ mt: 1 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Selected type</div>
              <ToggleButtonGroup size="small" value={selected.type} exclusive sx={{ mb: 1 }}>
                <ToggleButton value="text">Text</ToggleButton>
                <ToggleButton value="rect">Rectangle</ToggleButton>
                <ToggleButton value="circle">Circle</ToggleButton>
                <ToggleButton value="triangle">Triangle</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {selected.type === "text" && (
              <>
                <TextField label="Text" size="small" fullWidth value={selected.text} onChange={e => updateSelected("text", e.target.value)} />
                <Box>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Font size</div>
                  <Slider size="small" min={10} max={48} value={selected.fontSize || 16} onChange={(_, value) => updateSelected("fontSize", value)} />
                </Box>
              </>
            )}

            <Box>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Color</div>
              <input type="color" value={selected.fill} onChange={e => updateSelected("fill", e.target.value)} style={{ width: "100%", height: 32, borderRadius: 6, border: "1px solid #e5e7eb" }} />
            </Box>

            <Button variant="outlined" color="error" size="small" onClick={() => { setElements(prev => prev.filter(el => el.id !== selected.id)); setSelectedId(null); }}>Delete element</Button>
          </>
        ) : (
          <p style={{ fontSize: 12, color: "#6b7280" }}>Click on a shape or text on the canvas to edit it here.</p>
        )}
      </Box>
    </Box>
  );
}