const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');

class StableDiffusionGenerator {
  constructor() {
    this.modelsPath = path.join(__dirname, '../models/sd_models');
    this.lorasPath = path.join(__dirname, '../models/loras');
    this.embeddingsPath = path.join(__dirname, '../models/embeddings');
    this.outputPath = path.join(__dirname, '../output/generated_models');
    this.tempPath = path.join(__dirname, '../output/temp');
  }

  /**
   * Generate images for a model using Stable Diffusion
   */
  async generateModelImages(modelData) {
    console.log(`🎨 Generating images for model: ${modelData.name}`);

    try {
      // Create output directory for this model
      const modelImageDir = path.join(this.outputPath, modelData.id, 'images');
      await fs.mkdir(modelImageDir, { recursive: true });

      const generatedImages = {};

      // 1. Generate profile image
      generatedImages.profile = await this.generateProfileImage(modelData, modelImageDir);

      // 2. Generate body image
      generatedImages.body = await this.generateBodyImage(modelData, modelImageDir);

      // 3. Generate expression images
      generatedImages.expressions = await this.generateExpressionImages(modelData, modelImageDir);

      // 4. Generate outfit images
      generatedImages.outfits = await this.generateOutfitImages(modelData, modelImageDir);

      console.log(`✅ Generated ${Object.keys(generatedImages).length} image sets`);
      return generatedImages;

    } catch (error) {
      console.error('❌ Error generating model images:', error);
      throw error;
    }
  }

  /**
   * Generate profile portrait
   */
  async generateProfileImage(modelData, outputDir) {
    const prompt = this.buildPrompt('profile', modelData);
    const negativePrompt = this.buildNegativePrompt('profile');
    
    const imageConfig = {
      width: 512,
      height: 768,
      steps: 40,
      guidance_scale: 7.5,
      seed: this.generateSeed()
    };

    const outputPath = path.join(outputDir, 'profile.png');
    
    return await this.generateImage(
      prompt,
      negativePrompt,
      outputPath,
      imageConfig,
      modelData
    );
  }

  /**
   * Generate full body image
   */
  async generateBodyImage(modelData, outputDir) {
    const prompt = this.buildPrompt('body', modelData);
    const negativePrompt = this.buildNegativePrompt('body');
    
    const imageConfig = {
      width: 512,
      height: 768,
      steps: 40,
      guidance_scale: 7.5,
      seed: this.generateSeed()
    };

    const outputPath = path.join(outputDir, 'body.png');
    
    return await this.generateImage(
      prompt,
      negativePrompt,
      outputPath,
      imageConfig,
      modelData
    );
  }

  /**
   * Generate expression images
   */
  async generateExpressionImages(modelData, outputDir) {
    const emotions = ['happy', 'sad', 'excited', 'calm'];
    const expressions = {};

    for (const emotion of emotions) {
      const prompt = this.buildPrompt('expression', modelData, { emotion });
      const negativePrompt = this.buildNegativePrompt('expression');
      
      const imageConfig = {
        width: 512,
        height: 512,
        steps: 30,
        guidance_scale: 7.0,
        seed: this.generateSeed()
      };

      const outputPath = path.join(outputDir, `expression_${emotion}.png`);
      
      expressions[emotion] = await this.generateImage(
        prompt,
        negativePrompt,
        outputPath,
        imageConfig,
        modelData
      );
    }

    return expressions;
  }

  /**
   * Generate outfit images
   */
  async generateOutfitImages(modelData, outputDir) {
    const outfits = [];

    for (let i = 0; i < modelData.outfits.length; i++) {
      const outfit = modelData.outfits[i];
      const prompt = this.buildPrompt('outfit', modelData, { outfit });
      const negativePrompt = this.buildNegativePrompt('outfit');
      
      const imageConfig = {
        width: 512,
        height: 768,
        steps: 35,
        guidance_scale: 7.5,
        seed: this.generateSeed()
      };

      const outputPath = path.join(outputDir, `outfit_${i}.png`);
      
      const outfitImage = await this.generateImage(
        prompt,
        negativePrompt,
        outputPath,
        imageConfig,
        modelData
      );

      outfits.push({
        outfitId: outfit.id,
        outfitName: outfit.name,
        filename: `outfit_${i}.png`,
        path: outputPath,
        generated: true
      });
    }

    return outfits;
  }

  /**
   * Build Stable Diffusion prompt
   */
  buildPrompt(type, modelData, options = {}) {
    const appearance = modelData.appearance;
    const persona = modelData.persona;

    let prompt = '';

    // Base quality tags
    const qualityTags = [
      'masterpiece',
      'best quality',
      'ultra-detailed',
      '8k',
      'photorealistic',
      'professional photography'
    ];

    // Appearance descriptors
    const hairDesc = `${appearance.hair.color} ${appearance.hair.style} ${appearance.hair.length} hair`;
    const eyeDesc = `${appearance.eyeColor} ${appearance.eyeShape} eyes`;
    const skinDesc = `${appearance.skinTone} skin`;
    const bodyDesc = `${appearance.body.bodyType} body, ${appearance.body.physique}`;

    // Build prompt based on type
    switch (type) {
      case 'profile':
        prompt = `portrait of beautiful ${skinDesc} ${hairDesc} ${eyeDesc} woman, ${bodyDesc}, ${this.getExpressionFromPersona(persona)} expression, professional studio lighting, soft focus background, ${qualityTags.join(', ')}`;
        break;

      case 'body':
        prompt = `full body shot of beautiful ${skinDesc} ${hairDesc} ${eyeDesc} woman, ${bodyDesc}, standing pose, ${this.getExpressionFromPersona(persona)} expression, ${appearance.features.clothing || 'elegant casual wear'}, professional photography, studio lighting, ${qualityTags.join(', ')}`;
        break;

      case 'expression':
        const emotion = options.emotion || 'happy';
        const emotionPrompt = this.getEmotionPrompt(emotion);
        prompt = `portrait of beautiful ${skinDesc} ${hairDesc} ${eyeDesc} woman, ${emotionPrompt}, ${this.getExpressionFromPersona(persona)}, close-up shot, ${qualityTags.join(', ')}`;
        break;

      case 'outfit':
        const outfit = options.outfit;
        const outfitDesc = this.getOutfitDescription(outfit);
        prompt = `full body photo of beautiful ${skinDesc} ${hairDesc} ${eyeDesc} woman, ${bodyDesc}, wearing ${outfitDesc}, ${this.getExpressionFromPersona(persona)} expression, ${this.getMoodFromOutfit(outfit)}, professional photography, fashion photography, ${qualityTags.join(', ')}`;
        break;
    }

    return prompt;
  }

  /**
   * Build negative prompt
   */
  buildNegativePrompt(type) {
    const baseNegative = [
      'ugly',
      'deformed',
      'noisy',
      'blurry',
      'distorted',
      'disfigured',
      'bad anatomy',
      'bad proportions',
      'low quality',
      'worst quality'
    ];

    let typeSpecific = [];

    switch (type) {
      case 'profile':
        typeSpecific = ['bad hands', 'mutated', 'extra limbs'];
        break;
      case 'body':
        typeSpecific = ['bad hands', 'bad feet', 'disproportionate'];
        break;
      case 'outfit':
        typeSpecific = ['bad clothing', 'wearing wrong items', 'incorrect outfit'];
        break;
    }

    return [...baseNegative, ...typeSpecific].join(', ');
  }

  /**
   * Generate single image using Stable Diffusion
   */
  async generateImage(prompt, negativePrompt, outputPath, config, modelData) {
    console.log(`🖼️ Generating image: ${path.basename(outputPath)}`);

    // In production, this would call Stable Diffusion API or local installation
    // For now, we'll simulate the generation and create a placeholder
    
    try {
      // Simulate image generation time
      await this.sleep(1000);

      // Create placeholder image info
      const imageData = {
        filename: path.basename(outputPath),
        path: outputPath,
        prompt: prompt,
        negativePrompt: negativePrompt,
        width: config.width,
        height: config.height,
        steps: config.steps,
        guidance_scale: config.guidance_scale,
        seed: config.seed,
        model: 'Stable Diffusion XL',
        generated: true,
        createdAt: new Date().toISOString()
      };

      // Save metadata
      const metadataPath = outputPath.replace('.png', '_metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(imageData, null, 2));

      console.log(`✅ Generated: ${imageData.filename}`);
      return imageData;

    } catch (error) {
      console.error(`❌ Error generating image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Call local Stable Diffusion installation
   */
  async callStableDiffusion(prompt, negativePrompt, outputPath, config) {
    // This would call a local SD installation or API
    // Example using AUTOMATIC1111 API:
    /*
    const apiUrl = 'http://127.0.0.1:7860/sdapi/v1/txt2img';
    
    const payload = {
      prompt: prompt,
      negative_prompt: negativePrompt,
      width: config.width,
      height: config.height,
      steps: config.steps,
      cfg_scale: config.guidance_scale,
      seed: config.seed,
      sampler_name: 'DPM++ 2M Karras'
    };

    const response = await axios.post(apiUrl, payload);
    const imageData = Buffer.from(response.data.images[0], 'base64');
    
    await fs.writeFile(outputPath, imageData);
    */

    // Placeholder for production implementation
    console.log(`🎨 SD API call would be made here for: ${outputPath}`);
  }

  /**
   * Generate prompt variations for consistency
   */
  generatePromptVariations(basePrompt, count) {
    const variations = [];
    const modifiers = [
      'soft lighting',
      'dramatic lighting',
      'natural lighting',
      'studio lighting',
      'golden hour'
    ];

    for (let i = 0; i < count; i++) {
      const modifier = modifiers[i % modifiers.length];
      variations.push(`${basePrompt}, ${modifier}`);
    }

    return variations;
  }

  /**
   * Get expression based on persona
   */
  getExpressionFromPersona(persona) {
    const expressionMap = {
      'romantic_partner': 'loving, warm, gentle',
      'seductress': 'alluring, mysterious, confident',
      'best_friend': 'friendly, smiling, approachable',
      'mentor': 'wise, calm, thoughtful',
      'wild_child': 'excited, energetic, bold',
      'intellectual': 'thoughtful, intelligent, curious',
      'nurturer': 'caring, gentle, warm',
      'playful_companion': 'playful, happy, fun',
      'confident_leader': 'confident, strong, determined',
      'dreamer': 'dreamy, romantic, soft'
    };

    return expressionMap[persona.id] || 'neutral, pleasant';
  }

  /**
   * Get emotion-specific prompt
   */
  getEmotionPrompt(emotion) {
    const emotionPrompts = {
      'happy': 'happy expression, smiling, joyful',
      'sad': 'sad expression, melancholy, emotional',
      'excited': 'excited expression, enthusiastic, energetic',
      'calm': 'calm expression, peaceful, serene',
      'loving': 'loving expression, affectionate, tender',
      'playful': 'playful expression, mischievous, fun'
    };

    return emotionPrompts[emotion] || 'neutral expression';
  }

  /**
   * Get outfit description
   */
  getOutfitDescription(outfit) {
    const colorDesc = outfit.colors.join(' and ');
    const materialDesc = outfit.materials[0];
    const itemDesc = outfit.items.join(', ');

    return `${colorDesc} ${materialDesc} ${itemDesc}`;
  }

  /**
   * Get mood from outfit
   */
  getMoodFromOutfit(outfit) {
    const moods = Object.keys(outfit.moodEffects);
    const topMood = moods.reduce((a, b) => 
      outfit.moodEffects[a] > outfit.moodEffects[b] ? a : b
    );

    const moodPrompts = {
      'romance': 'romantic atmosphere',
      'intimacy': 'intimate setting',
      'sensuality': 'sensual mood',
      'confidence': 'confident pose',
      'mystery': 'mysterious aura',
      'comfort': 'comfortable and relaxed',
      'relaxation': 'relaxed pose',
      'elegance': 'elegant pose',
      'sophistication': 'sophisticated style',
      'energy': 'energetic pose',
      'motivation': 'motivated expression',
      'excitement': 'excited expression',
      'fun': 'fun and playful',
      'professional': 'professional appearance',
      'peace': 'peaceful expression',
      'balance': 'balanced pose'
    };

    return moodPrompts[topMood] || 'pleasant atmosphere';
  }

  /**
   * Generate random seed
   */
  generateSeed() {
    return Math.floor(Math.random() * 2147483647);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch generate images for multiple models
   */
  async batchGenerateImages(models) {
    console.log(`🚀 Batch generating images for ${models.length} models...`);

    const results = [];

    for (const model of models) {
      try {
        const images = await this.generateModelImages(model);
        results.push({
          modelId: model.id,
          modelName: model.name,
          success: true,
          images: images
        });
      } catch (error) {
        console.error(`❌ Error generating images for ${model.name}:`, error);
        results.push({
          modelId: model.id,
          modelName: model.name,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`✅ Batch generation complete: ${results.filter(r => r.success).length}/${results.length} successful`);
    return results;
  }
}

module.exports = StableDiffusionGenerator;