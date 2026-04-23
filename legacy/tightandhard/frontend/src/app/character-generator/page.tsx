'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface GenerationParams {
  prompt: string;
  negativePrompts: string[];
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed: number;
  useControlNet: boolean;
  controlNetType: string;
  useFaceSwap: boolean;
  useLoRA: boolean;
}

interface GeneratedImage {
  imageId: string;
  imageUrl: string;
  qualityMetrics: {
    photorealismScore: number;
    consistencyScore: number;
    compositionScore: number;
    overallScore: number;
  };
  generationTime: number;
}

export default function CharacterGeneratorPage() {
  const [characterId, setCharacterId] = useState('');
  const [params, setParams] = useState<GenerationParams>({
    prompt: '',
    negativePrompts: [],
    width: 1024,
    height: 1024,
    steps: 30,
    cfgScale: 7.5,
    seed: -1,
    useControlNet: false,
    controlNetType: 'openpose',
    useFaceSwap: false,
    useLoRA: false
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  
  const handleGenerate = async () => {
    if (!params.prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/character-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId,
          ...params
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedImages([...generatedImages, data.data]);
        setSelectedImage(data.data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate image');
    }
    
    setIsGenerating(false);
  };
  
  const handleBatchGenerate = async (count: number) => {
    if (!params.prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/character-generator/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId,
          params,
          count
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedImages([...generatedImages, ...data.data]);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Batch generation error:', error);
      alert('Failed to generate images');
    }
    
    setIsGenerating(false);
  };
  
  const handleUpscale = async (imageId: string) => {
    try {
      const response = await fetch('/api/character-generator/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          scaleFactor: 2
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Image upscaled successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Upscale error:', error);
      alert('Failed to upscale image');
    }
  };
  
  const handleRetouch = async (imageId: string) => {
    try {
      const response = await fetch('/api/character-generator/retouch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          retouchOptions: {
            enhanceSkin: true,
            fixEyes: true,
            adjustLighting: true,
            addGrain: true
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Image retouched successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Retouch error:', error);
      alert('Failed to retouch image');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          AI Character Generator
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Generation Controls */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">
                Generation Settings
              </h2>
              
              {/* Character ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Character ID
                </label>
                <input
                  type="text"
                  value={characterId}
                  onChange={(e) => setCharacterId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Enter character ID"
                />
              </div>
              
              {/* Prompt */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prompt
                </label>
                <textarea
                  value={params.prompt}
                  onChange={(e) => setParams({...params, prompt: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white h-32"
                  placeholder="Describe your character..."
                />
              </div>
              
              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Width
                  </label>
                  <select
                    value={params.width}
                    onChange={(e) => setParams({...params, width: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value={512}>512</option>
                    <option value={768}>768</option>
                    <option value={1024}>1024</option>
                    <option value={1280}>1280</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Height
                  </label>
                  <select
                    value={params.height}
                    onChange={(e) => setParams({...params, height: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value={512}>512</option>
                    <option value={768}>768</option>
                    <option value={1024}>1024</option>
                    <option value={1280}>1280</option>
                  </select>
                </div>
              </div>
              
              {/* Steps */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Steps: {params.steps}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={params.steps}
                  onChange={(e) => setParams({...params, steps: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              {/* CFG Scale */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CFG Scale: {params.cfgScale}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={params.cfgScale}
                  onChange={(e) => setParams({...params, cfgScale: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              {/* Seed */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Seed (-1 for random)
                </label>
                <input
                  type="number"
                  value={params.seed}
                  onChange={(e) => setParams({...params, seed: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              
              {/* Advanced Options */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Advanced Options
                </h3>
                
                <label className="flex items-center text-gray-300 mb-2">
                  <input
                    type="checkbox"
                    checked={params.useControlNet}
                    onChange={(e) => setParams({...params, useControlNet: e.target.checked})}
                    className="mr-2"
                  />
                  Use ControlNet
                </label>
                
                {params.useControlNet && (
                  <select
                    value={params.controlNetType}
                    onChange={(e) => setParams({...params, controlNetType: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4"
                  >
                    <option value="openpose">OpenPose</option>
                    <option value="canny">Canny</option>
                    <option value="depth">Depth</option>
                  </select>
                )}
                
                <label className="flex items-center text-gray-300 mb-2">
                  <input
                    type="checkbox"
                    checked={params.useFaceSwap}
                    onChange={(e) => setParams({...params, useFaceSwap: e.target.checked})}
                    className="mr-2"
                  />
                  Use Face Swap
                </label>
                
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={params.useLoRA}
                    onChange={(e) => setParams({...params, useLoRA: e.target.checked})}
                    className="mr-2"
                  />
                  Use LoRA Model
                </label>
              </div>
              
              {/* Generate Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? 'Generating...' : 'Generate Image'}
                </Button>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleBatchGenerate(3)}
                    disabled={isGenerating}
                    variant="outline"
                    className="text-sm"
                  >
                    Batch 3
                  </Button>
                  <Button
                    onClick={() => handleBatchGenerate(5)}
                    disabled={isGenerating}
                    variant="outline"
                    className="text-sm"
                  >
                    Batch 5
                  </Button>
                  <Button
                    onClick={() => handleBatchGenerate(10)}
                    disabled={isGenerating}
                    variant="outline"
                    className="text-sm"
                  >
                    Batch 10
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Middle Panel - Generated Images */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">
                Generated Images ({generatedImages.length})
              </h2>
              
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                {generatedImages.map((image) => (
                  <div
                    key={image.imageId}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedImage?.imageId === image.imageId
                        ? 'bg-purple-600/30 border-2 border-purple-500'
                        : 'bg-slate-700/50 hover:bg-slate-600/50'
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.imageUrl}
                      alt="Generated character"
                      className="w-full rounded-lg"
                    />
                    <div className="mt-2 text-sm text-gray-300">
                      <p>Score: {image.qualityMetrics.overallScore.toFixed(1)}</p>
                      <p>Time: {image.generationTime}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Right Panel - Image Details */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">
                Image Details
              </h2>
              
              {selectedImage ? (
                <div className="space-y-4">
                  <img
                    src={selectedImage.imageUrl}
                    alt="Selected character"
                    className="w-full rounded-lg"
                  />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                      Quality Metrics
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-300">
                        Photorealism: {selectedImage.qualityMetrics.photorealismScore.toFixed(1)}%
                      </p>
                      <p className="text-gray-300">
                        Consistency: {selectedImage.qualityMetrics.consistencyScore.toFixed(1)}%
                      </p>
                      <p className="text-gray-300">
                        Composition: {selectedImage.qualityMetrics.compositionScore.toFixed(1)}%
                      </p>
                      <p className="text-gray-300 font-semibold">
                        Overall: {selectedImage.qualityMetrics.overallScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                      Post-Processing
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleUpscale(selectedImage.imageId)}
                        variant="outline"
                        className="text-sm"
                      >
                        Upscale 2x
                      </Button>
                      <Button
                        onClick={() => handleRetouch(selectedImage.imageId)}
                        variant="outline"
                        className="text-sm"
                      >
                        Retouch
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">
                      Image ID: {selectedImage.imageId}
                    </p>
                    <p className="text-sm text-gray-400">
                      Generation Time: {selectedImage.generationTime}ms
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>Select an image to view details</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}