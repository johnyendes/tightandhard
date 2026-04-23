/**
 * Model Preview System
 * Builds 2D renders from config with extensibility for SD/Unity integration
 */

class ModelPreview {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    // Default configuration
    this.config = {
      backgroundColor: '#2a2a2a',
      gridEnabled: true,
      gridSize: 20,
      gridColor: '#444',
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      renderMode: '2d', // '2d', 'wireframe', 'preview'
      ...options
    };
    
    // Plugin system for SD/Unity integration
    this.plugins = new Map();
    this.renderLayers = [];
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.bindEvents();
  }
  
  setupCanvas() {
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.clear();
  }
  
  bindEvents() {
    // Mouse interaction for pan/zoom
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    
    this.canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        this.config.offsetX += deltaX;
        this.config.offsetY += deltaY;
        lastX = e.clientX;
        lastY = e.clientY;
        this.render();
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      this.config.scale *= zoomFactor;
      this.render();
    });
  }
  
  // Plugin system for extensibility
  registerPlugin(name, plugin) {
    this.plugins.set(name, plugin);
    if (plugin.init) {
      plugin.init(this);
    }
  }
  
  getPlugin(name) {
    return this.plugins.get(name);
  }
  
  // Layer system for complex renders
  addLayer(layer) {
    this.renderLayers.push(layer);
    return this.renderLayers.length - 1;
  }
  
  removeLayer(index) {
    this.renderLayers.splice(index, 1);
  }
  
  clear() {
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  drawGrid() {
    if (!this.config.gridEnabled) return;
    
    this.ctx.strokeStyle = this.config.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    
    const gridSize = this.config.gridSize * this.config.scale;
    const startX = (this.config.offsetX % gridSize);
    const startY = (this.config.offsetY % gridSize);
    
    // Vertical lines
    for (let x = startX; x < this.width; x += gridSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    
    // Horizontal lines
    for (let y = startY; y < this.height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    
    this.ctx.stroke();
  }
  
  // Transform coordinates based on scale and offset
  transform(x, y) {
    return [
      x * this.config.scale + this.config.offsetX,
      y * this.config.scale + this.config.offsetY
    ];
  }
  
  // Render primitive shapes
  drawShape(shape) {
    this.ctx.save();
    
    const [x, y] = this.transform(shape.x || 0, shape.y || 0);
    
    this.ctx.fillStyle = shape.fillColor || '#fff';
    this.ctx.strokeStyle = shape.strokeColor || '#000';
    this.ctx.lineWidth = (shape.strokeWidth || 1) * this.config.scale;
    
    switch (shape.type) {
      case 'rect':
        const w = (shape.width || 50) * this.config.scale;
        const h = (shape.height || 50) * this.config.scale;
        this.ctx.fillRect(x, y, w, h);
        if (shape.strokeWidth) {
          this.ctx.strokeRect(x, y, w, h);
        }
        break;
        
      case 'circle':
        const r = (shape.radius || 25) * this.config.scale;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fill();
        if (shape.strokeWidth) {
          this.ctx.stroke();
        }
        break;
        
      case 'line':
        const [x2, y2] = this.transform(shape.x2 || 0, shape.y2 || 0);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        break;
        
      case 'polygon':
        if (shape.points && shape.points.length > 0) {
          this.ctx.beginPath();
          const [firstX, firstY] = this.transform(shape.points[0].x, shape.points[0].y);
          this.ctx.moveTo(firstX, firstY);
          
          for (let i = 1; i < shape.points.length; i++) {
            const [px, py] = this.transform(shape.points[i].x, shape.points[i].y);
            this.ctx.lineTo(px, py);
          }
          
          this.ctx.closePath();
          this.ctx.fill();
          if (shape.strokeWidth) {
            this.ctx.stroke();
          }
        }
        break;
    }
    
    this.ctx.restore();
  }
  
  // Render from configuration object
  renderFromConfig(modelConfig) {
    this.clear();
    this.drawGrid();
    
    // Render layers first
    this.renderLayers.forEach(layer => {
      if (layer.visible !== false) {
        layer.render(this.ctx, this.config);
      }
    });
    
    // Render model elements
    if (modelConfig.elements) {
      modelConfig.elements.forEach(element => {
        this.drawShape(element);
      });
    }
    
    // Apply plugins
    this.plugins.forEach(plugin => {
      if (plugin.render) {
        plugin.render(this.ctx, this.config, modelConfig);
      }
    });
  }
  
  // Main render method
  render(modelConfig = null) {
    if (modelConfig) {
      this.renderFromConfig(modelConfig);
    } else {
      this.clear();
      this.drawGrid();
      
      // Render layers
      this.renderLayers.forEach(layer => {
        if (layer.visible !== false) {
          layer.render(this.ctx, this.config);
        }
      });
    }
  }
  
  // Export for SD/Unity integration
  exportData() {
    return {
      config: this.config,
      layers: this.renderLayers.map(layer => layer.export ? layer.export() : layer),
      canvas: {
        width: this.width,
        height: this.height,
        dataURL: this.canvas.toDataURL()
      }
    };
  }
  
  // Load configuration
  loadConfig(config) {
    this.config = { ...this.config, ...config };
    this.render();
  }
  
  // Update single config property
  updateConfig(key, value) {
    this.config[key] = value;
    this.render();
  }
  
  // Resize canvas
  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.setupCanvas();
    this.render();
  }
}

// Sample plugins for SD/Unity integration
const StableDiffusionPlugin = {
  init(preview) {
    this.preview = preview;
  },
  
  render(ctx, config, modelConfig) {
    // Placeholder for SD-specific rendering
    if (config.renderMode === 'sd-preview') {
      // Add SD-specific visual indicators
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(10, 10, 100, 20);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText('SD Ready', 15, 25);
      ctx.restore();
    }
  },
  
  exportForSD(preview) {
    const data = preview.exportData();
    return {
      prompt: data.config.prompt || '',
      dimensions: { width: data.canvas.width, height: data.canvas.height },
      layers: data.layers,
      preview: data.canvas.dataURL
    };
  }
};

const UnityPlugin = {
  init(preview) {
    this.preview = preview;
  },
  
  render(ctx, config, modelConfig) {
    if (config.renderMode === 'unity-preview') {
      // Add Unity-specific visual indicators
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(10, 35, 100, 20);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText('Unity Ready', 15, 50);
      ctx.restore();
    }
  },
  
  exportForUnity(preview) {
    const data = preview.exportData();
    return {
      gameObjects: data.layers.map(layer => ({
        name: layer.name || 'GameObject',
        transform: layer.transform || { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        components: layer.components || []
      })),
      scene: {
        name: 'GeneratedScene',
        settings: data.config
      }
    };
  }
};

// Usage example and factory
function createModelPreview(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    throw new Error(`Canvas with id '${canvasId}' not found`);
  }
  
  const preview = new ModelPreview(canvas, options);
  
  // Register default plugins
  preview.registerPlugin('stable-diffusion', StableDiffusionPlugin);
  preview.registerPlugin('unity', UnityPlugin);
  
  return preview;
}

module.exports = { ModelPreview, createModelPreview, StableDiffusionPlugin, UnityPlugin };