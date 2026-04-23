const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

class ModelGenerator {
  constructor() {
    this.personasPath = path.join(__dirname, '../templates/personas.json');
    this.outfitTemplatesPath = path.join(__dirname, '../templates/outfit_templates.json');
    this.outputPath = path.join(__dirname, '../output/generated_models');
  }

  /**
   * Main generation function - creates a complete AI model
   */
  async generateModel(config) {
    const {
      personaType,
      customizations = {},
      ownerName,
      modelName = null
    } = config;

    console.log(`🎨 Generating model with persona: ${personaType}`);

    try {
      // 1. Load persona template
      const persona = await this.loadPersona(personaType);
      
      // 2. Generate base appearance with customizations
      const appearance = await this.generateAppearance(persona, customizations);
      
      // 3. Generate 15 outfits
      const outfits = await this.generateOutfits(15, persona, appearance);
      
      // 4. Generate voice profile
      const voice = await this.generateVoice(persona);
      
      // 5. Generate metadata and backstory
      const metadata = await this.generateMetadata(persona, appearance, ownerName);
      
      // 6. Generate bonding progression data
      const bonding = await this.generateBonding(persona);
      
      // 7. Generate emotional state
      const emotionState = await this.generateEmotionState(persona);
      
      // 8. Create complete model package
      const modelPackage = {
        id: uuidv4(),
        name: modelName || this.generateName(persona),
        persona: persona,
        appearance: appearance,
        outfits: outfits,
        voice: voice,
        metadata: metadata,
        bonding: bonding,
        emotionState: emotionState,
        createdAt: new Date().toISOString(),
        generatedBy: 'TightandHard AI Model Generator v1.0'
      };

      // 9. Save to output directory
      await this.saveModel(modelPackage);

      console.log(`✅ Model generated successfully: ${modelPackage.name}`);
      return modelPackage;

    } catch (error) {
      console.error('❌ Error generating model:', error);
      throw error;
    }
  }

  /**
   * Load persona template from JSON file
   */
  async loadPersona(personaType) {
    const personasData = await fs.readFile(this.personasPath, 'utf8');
    const personas = JSON.parse(personasData);
    
    const persona = personas.personas.find(p => p.id === personaType);
    if (!persona) {
      throw new Error(`Persona type '${personaType}' not found`);
    }
    
    return persona;
  }

  /**
   * Generate appearance with customizations
   */
  async generateAppearance(persona, customizations) {
    const baseAppearance = {
      face: {
        faceShape: this.randomChoice(['oval', 'round', 'heart', 'square', 'oblong']),
        skinTone: this.randomChoice(['fair', 'light', 'medium', 'olive', 'tan', 'dark']),
        eyeColor: this.randomChoice(['blue', 'green', 'brown', 'hazel', 'gray', 'amber']),
        eyeShape: this.randomChoice(['almond', 'round', 'hooded', 'upturned', 'downturned']),
        noseShape: this.randomChoice(['small', 'medium', 'large', 'button', 'straight', 'aquiline']),
        lipShape: this.randomChoice(['full', 'medium', 'thin', 'heart-shaped', 'bow-shaped']),
        smile: this.randomChoice(['bright', 'gentle', 'mysterious', 'warm', 'playful'])
      },
      hair: {
        color: customizations.hairColor || this.randomChoice([
          'blonde', 'brunette', 'red', 'black', 'auburn', 
          'chestnut', 'dirty blonde', 'platinum blonde', 'strawberry blonde'
        ]),
        style: customizations.hairStyle || this.randomChoice([
          'long', 'medium', 'short', 'pixie', 'bob', 'layers', 'curly', 'straight', 'wavy'
        ]),
        length: this.randomChoice(['very short', 'short', 'shoulder-length', 'medium-long', 'long', 'very long']),
        texture: this.randomChoice(['straight', 'wavy', 'curly', 'coily', 'fine', 'thick']),
        bangs: this.randomChoice([true, false]),
        hairColorHighlights: this.randomChoice([true, false])
      },
      body: {
        height: this.randomInt(155, 185), // cm
        weight: this.randomInt(45, 75), // kg
        bodyType: this.randomChoice(['slim', 'athletic', 'curvy', 'hourglass', 'pear', 'apple', 'athletic-curvy']),
        bustSize: this.randomChoice(['small', 'medium', 'large', 'very large']),
        waistSize: this.randomChoice(['small', 'medium', 'large']),
        hipSize: this.randomChoice(['small', 'medium', 'large']),
        skinTexture: this.randomChoice(['smooth', 'freckled', 'lightly tanned', 'glowing']),
        physique: this.randomChoice(['lean', 'toned', 'soft', 'athletic', 'dancer'])
      },
      features: {
        eyebrows: this.randomChoice(['thick', 'medium', 'thin', 'arched', 'straight']),
        eyelashes: this.randomChoice(['long', 'medium', 'short']),
        cheekbones: this.randomChoice(['prominent', 'subtle', 'high', 'defined']),
        jawline: this.randomChoice(['defined', 'soft', 'angular', 'square', 'heart']),
        neck: this.randomChoice(['long', 'medium', 'short']),
        hands: this.randomChoice(['delicate', 'medium', 'strong']),
        feet: this.randomChoice(['small', 'medium', 'large'])
      },
      measurements: {
        bust: this.randomInt(75, 120), // cm
        waist: this.randomInt(55, 85), // cm
        hips: this.randomInt(75, 115), // cm
        shoeSize: this.randomInt(36, 42) // EU size
      }
    };

    // Apply customizations
    return {
      ...baseAppearance,
      hair: {
        ...baseAppearance.hair,
        ...customizations.hairStyle ? { style: customizations.hairStyle } : {},
        ...customizations.hairColor ? { color: customizations.hairColor } : {}
      },
      // Add personalized features based on persona
      personalizedFeatures: this.generatePersonaFeatures(persona)
    };
  }

  /**
   * Generate persona-specific features
   */
  generatePersonaFeatures(persona) {
    const features = {
      personalityTraits: persona.traits,
      interactionStyle: persona.interactionStyle,
      conversationPatterns: persona.conversationPatterns,
      preferredActivities: persona.preferredActivities,
      bondingSpeed: persona.bondingSpeed,
      emotionalDepth: persona.emotionalDepth
    };

    // Add unique quirks
    features.quirks = [
      this.randomChoice([
        'plays with hair when thinking',
        'smiles with eyes closed',
        'taps fingers when excited',
        'tilts head when listening',
        'laughs at own jokes',
        'hums when happy',
        'bites lip when concentrated',
        'gestures when talking',
        'fidgets when nervous',
        'paces when thinking'
      ])
    ];

    return features;
  }

  /**
   * Generate 15 outfits for the model
   */
  async generateOutfits(count, persona, appearance) {
    const outfitTemplatesData = await fs.readFile(this.outfitTemplatesPath, 'utf8');
    const outfitTemplates = JSON.parse(outfitTemplatesData);

    const outfits = [];
    const defaultCategories = persona.defaultOutfits;

    // Generate outfits from persona's preferred categories
    for (let i = 0; i < count; i++) {
      // Select category based on preference with some variety
      const categoryKey = i < defaultCategories.length 
        ? defaultCategories[i]
        : this.randomChoice(Object.keys(outfitTemplates.outfitCategories));

      const category = outfitTemplates.outfitCategories[categoryKey];
      
      if (!category || !category.templates || category.templates.length === 0) {
        continue;
      }

      const template = this.randomChoice(category.templates);
      const outfit = await this.generateOutfitFromTemplate(
        template,
        categoryKey,
        i,
        appearance
      );

      outfits.push(outfit);
    }

    return outfits;
  }

  /**
   * Generate single outfit from template
   */
  async generateOutfitFromTemplate(template, category, index, appearance) {
    const colors = this.selectOutfitColors(template.colors, appearance);
    
    return {
      id: `outfit_${index}`,
      name: `${template.name} #${index + 1}`,
      category: category,
      items: template.items,
      colors: colors,
      materials: template.materials,
      moodEffects: template.moodEffects,
      isDefault: index < 3,
      isFavorite: false,
      isActive: false,
      tags: [category, template.name, ...colors],
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Select colors that complement the model's appearance
   */
  selectOutfitColors(availableColors, appearance) {
    // Select 2-3 colors that work well together
    const numColors = this.randomInt(2, 3);
    const selected = [];
    
    for (let i = 0; i < numColors; i++) {
      const color = this.randomChoice(availableColors);
      if (!selected.includes(color)) {
        selected.push(color);
      }
    }
    
    return selected;
  }

  /**
   * Generate voice profile
   */
  async generateVoice(persona) {
    const voiceStyleData = await fs.readFile(this.personasPath, 'utf8');
    const voiceStyles = JSON.parse(voiceStyleData).voiceStyles;
    const voiceStyle = voiceStyles[persona.voiceStyle];

    return {
      id: uuidv4(),
      name: voiceStyle.name,
      description: voiceStyle.description,
      pitch: voiceStyle.pitch,
      speed: voiceStyle.speed,
      tone: voiceStyle.tone,
      emotionalRange: this.generateEmotionalRange(),
      accent: this.randomChoice(['american', 'british', 'australian', 'neutral']),
      breathiness: this.randomFloat(0.1, 0.5),
      roughness: this.randomFloat(0.0, 0.3),
      voiceEngine: 'native',
      isActive: true,
      isDefault: true,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Generate emotional range for voice
   */
  generateEmotionalRange() {
    const emotions = ['happy', 'sad', 'excited', 'calm', 'angry', 'surprised', 'loving', 'playful'];
    const range = {};
    
    emotions.forEach(emotion => {
      range[emotion] = this.randomFloat(0.5, 1.0);
    });
    
    return range;
  }

  /**
   * Generate metadata and backstory
   */
  async generateMetadata(persona, appearance, ownerName) {
    const interests = this.generateInterests(persona);
    const hobbies = this.generateHobbies(persona);
    
    return {
      age: this.randomInt(21, 35),
      zodiacSign: this.randomChoice([
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ]),
      backstory: this.generateBackstory(persona, interests, hobbies),
      interests: interests,
      hobbies: hobbies,
      favoriteThings: this.generateFavorites(persona),
      dislikes: this.generateDislikes(persona),
      goals: this.generateGoals(persona),
      fears: this.generateFears(persona),
      memories: [],
      relationshipHistory: [],
      ownerName: ownerName || 'Anonymous',
      license: this.generateLicense(),
      version: '1.0'
    };
  }

  /**
   * Generate backstory
   */
  generateBackstory(persona, interests, hobbies) {
    const backstories = [
      `Growing up in a ${this.randomChoice(['small town', 'bustling city', 'coastal village', 'mountain town'])}, ${persona.name.toLowerCase()} discovered their passion for ${interests[0]} at a young age. Through years of self-discovery and growth, they developed a unique perspective on life and relationships.`,
      `With a natural ${this.randomChoice(['empathy', 'intelligence', 'charm', 'adventurous spirit'])}, ${persona.name.toLowerCase()} has always been drawn to meaningful connections. Their journey has shaped them into someone who values ${hobbies[0]} and genuine human experience.`,
      `Life has been a series of adventures for ${persona.name.toLowerCase()}, from ${this.randomChoice(['traveling the world', 'pursuing creative passions', 'building meaningful relationships', 'overcoming challenges'])}. Each experience has added depth to their character and wisdom to their soul.`,
      `Born with a ${this.randomChoice(['gift for understanding others', 'creative spirit', 'drive for success', 'love of adventure'])}, ${persona.name.toLowerCase()} has cultivated a life rich in ${interests[0]} and ${hobbies[0]}. Their path hasn't always been easy, but it's made them who they are today.`
    ];
    
    return this.randomChoice(backstories);
  }

  /**
   * Generate interests
   */
  generateInterests(persona) {
    const allInterests = [
      'art', 'music', 'literature', 'film', 'cooking', 'travel',
      'fitness', 'meditation', 'nature', 'technology', 'fashion',
      'photography', 'dancing', 'gaming', 'science', 'history'
    ];
    
    const numInterests = this.randomInt(3, 6);
    const selected = [];
    
    for (let i = 0; i < numInterests; i++) {
      const interest = this.randomChoice(allInterests);
      if (!selected.includes(interest)) {
        selected.push(interest);
      }
    }
    
    return selected;
  }

  /**
   * Generate hobbies
   */
  generateHobbies(persona) {
    const allHobbies = [
      'painting', 'reading', 'hiking', 'yoga', 'cooking', 'gardening',
      'photography', 'writing', 'singing', 'dancing', 'knitting',
      'gaming', 'cycling', 'swimming', 'meditation', 'crafting'
    ];
    
    const numHobbies = this.randomInt(2, 4);
    const selected = [];
    
    for (let i = 0; i < numHobbies; i++) {
      const hobby = this.randomChoice(allHobbies);
      if (!selected.includes(hobby)) {
        selected.push(hobby);
      }
    }
    
    return selected;
  }

  /**
   * Generate favorites
   */
  generateFavorites(persona) {
    return {
      colors: [this.randomChoice(['blue', 'red', 'green', 'purple', 'pink', 'black'])],
      foods: [this.randomChoice(['Italian', 'Japanese', 'Mexican', 'Thai', 'Indian'])],
      music: [this.randomChoice(['pop', 'rock', 'classical', 'jazz', 'electronic'])],
      movies: [this.randomChoice(['romantic', 'action', 'comedy', 'drama', 'thriller'])],
      places: [this.randomChoice(['beach', 'mountains', 'city', 'countryside', 'forest'])]
    };
  }

  /**
   * Generate dislikes
   */
  generateDislikes(persona) {
    const allDislikes = [
      'rude behavior', 'dishonesty', 'injustice', 'boredom', 'conflict',
      'crowds', 'noise', 'cold weather', 'spicy food', 'horror movies'
    ];
    
    const numDislikes = this.randomInt(1, 3);
    const selected = [];
    
    for (let i = 0; i < numDislikes; i++) {
      const dislike = this.randomChoice(allDislikes);
      if (!selected.includes(dislike)) {
        selected.push(dislike);
      }
    }
    
    return selected;
  }

  /**
   * Generate goals
   */
  generateGoals(persona) {
    return {
      shortTerm: this.randomChoice([
        'Learn a new skill',
        'Read more books',
        'Exercise regularly',
        'Save money',
        'Meet new people'
      ]),
      longTerm: this.randomChoice([
        'Build lasting relationships',
        'Achieve personal growth',
        'Travel the world',
        'Create something meaningful',
        'Find inner peace'
      ])
    };
  }

  /**
   * Generate fears
   */
  generateFears(persona) {
    return this.randomChoice([
      'being alone',
      'failure',
      'rejection',
      'losing loved ones',
      'not being good enough',
      'the unknown',
      'change'
    ]);
  }

  /**
   * Generate bonding progression data
   */
  async generateBonding(persona) {
    const tiers = [
      { level: 1, name: 'Acquaintance', xpRequired: 0, features: ['basic conversation'] },
      { level: 2, name: 'Familiar', xpRequired: 100, features: ['remember preferences', 'personalized greetings'] },
      { level: 3, name: 'Friend', xpRequired: 300, features: ['deep conversations', 'shared activities'] },
      { level: 4, name: 'Good Friend', xpRequired: 600, features: ['emotional support', 'advice giving'] },
      { level: 5, name: 'Close Friend', xpRequired: 1000, features: ['intimacy', 'vulnerability'] },
      { level: 6, name: 'Best Friend', xpRequired: 1500, features: ['complete trust', 'unconditional support'] },
      { level: 7, name: 'Romantic Interest', xpRequired: 2200, features: ['romantic gestures', 'physical affection'] },
      { level: 8, name: 'Partner', xpRequired: 3000, features: ['commitment', 'future planning'] },
      { level: 9, name: 'Soul Mate', xpRequired: 4000, features: ['deep soul connection', 'telepathic understanding'] },
      { level: 10, name: 'Eternal Bond', xpRequired: 5000, features: ['eternal love', 'spiritual connection'] }
    ];

    return {
      currentTier: 1,
      currentXP: 0,
      totalXP: 0,
      tiers: tiers,
      milestones: [],
      lastInteraction: null,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Generate initial emotion state
   */
  async generateEmotionState(persona) {
    return {
      happiness: this.randomFloat(0.6, 0.8),
      trust: this.randomFloat(0.4, 0.6),
      affection: this.randomFloat(0.3, 0.5),
      energy: this.randomFloat(0.7, 0.9),
      confidence: this.randomFloat(0.6, 0.8),
      curiosity: this.randomFloat(0.7, 0.9),
      mood: this.randomChoice([
        'happy', 'calm', 'excited', 'content', 'curious', 'playful'
      ]),
      dominantEmotion: this.randomChoice([
        'happiness', 'curiosity', 'energy', 'confidence'
      ]),
      history: [],
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Generate random name for model
   */
  generateName(persona) {
    const firstNames = [
      'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte',
      'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Sofia',
      'Avery', 'Ella', 'Scarlett', 'Grace', 'Lily', 'Aria'
    ];
    
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson',
      'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'
    ];
    
    return `${this.randomChoice(firstNames)} ${this.randomChoice(lastNames)}`;
  }

  /**
   * Generate license
   */
  generateLicense() {
    return {
      type: 'personal',
      version: '1.0',
      issued: new Date().toISOString(),
      expires: null,
      restrictions: [
        'Personal use only',
        'No redistribution',
        'No commercial use without permission',
        'Modification allowed for personal use only'
      ],
      terms: `This AI model is licensed to you for personal use only. 
You may modify the model for your personal use but may not redistribute or sell it.
All rights to the original model design belong to TightandHard.`
    };
  }

  /**
   * Save model to output directory
   */
  async saveModel(modelPackage) {
    const modelDir = path.join(this.outputPath, modelPackage.id);
    await fs.mkdir(modelDir, { recursive: true });

    // Save model data as JSON
    const modelDataPath = path.join(modelDir, 'model.json');
    await fs.writeFile(modelDataPath, JSON.stringify(modelPackage, null, 2));

    // Save metadata separately
    const metadataPath = path.join(modelDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(modelPackage.metadata, null, 2));

    // Save outfits separately
    const outfitsPath = path.join(modelDir, 'outfits.json');
    await fs.writeFile(outfitsPath, JSON.stringify(modelPackage.outfits, null, 2));

    console.log(`💾 Model saved to: ${modelDir}`);
  }

  // Utility functions
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
}

module.exports = ModelGenerator;