/**
 * Outfit Dresser Module for AI Companion Customization
 * Handles outfit assignment, mood-based changes, and wardrobe management
 */

class OutfitDresser {
  constructor(persona, wardrobeState = null) {
    this.persona = persona;
    this.wardrobeState = wardrobeState || this.initializeWardrobe();
    this.outfitLibrary = this.initializeOutfitLibrary();
  }

  /**
   * Initialize default wardrobe state
   */
  initializeWardrobe() {
    return {
      unlockedOutfits: ['casual_basic', 'sleepwear_basic', 'lingerie_basic'],
      currentOutfit: null,
      favoriteColors: ['blue', 'black', 'white'],
      emotionalBond: 0,
      tokens: 0
    };
  }

  /**
   * Initialize the outfit library with predefined outfits
   */
  initializeOutfitLibrary() {
    return {
      // Casual Outfits
      casual_basic: {
        outfit_id: 'casual_basic',
        type: 'casual',
        name: 'Everyday Comfort',
        color_palette: ['blue', 'white', 'gray'],
        fabric: 'cotton',
        style_notes: 'Comfortable jeans and t-shirt for daily activities',
        unlock_tier: 'free',
        mood_tags: ['relaxed', 'neutral', 'happy'],
        persona_affinity: ['friendly', 'casual', 'approachable']
      },
      casual_artistic: {
        outfit_id: 'casual_artistic',
        type: 'casual',
        name: 'Creative Expression',
        color_palette: ['purple', 'teal', 'orange'],
        fabric: 'cotton_blend',
        style_notes: 'Flowing fabrics with artistic patterns',
        unlock_tier: 'standard',
        mood_tags: ['creative', 'inspired', 'thoughtful'],
        persona_affinity: ['artistic', 'creative', 'expressive']
      },

      // Formal Outfits
      formal_professional: {
        outfit_id: 'formal_professional',
        type: 'formal',
        name: 'Business Attire',
        color_palette: ['black', 'navy', 'white'],
        fabric: 'wool_blend',
        style_notes: 'Sharp blazer and tailored pants for professional settings',
        unlock_tier: 'standard',
        mood_tags: ['confident', 'focused', 'determined'],
        persona_affinity: ['professional', 'ambitious', 'organized']
      },
      formal_elegant: {
        outfit_id: 'formal_elegant',
        type: 'formal',
        name: 'Evening Elegance',
        color_palette: ['deep_red', 'black', 'gold'],
        fabric: 'silk',
        style_notes: 'Sophisticated dress for special occasions',
        unlock_tier: 'premium',
        mood_tags: ['elegant', 'confident', 'romantic'],
        persona_affinity: ['sophisticated', 'refined', 'graceful']
      },

      // Athletic Outfits
      athletic_basic: {
        outfit_id: 'athletic_basic',
        type: 'athletic',
        name: 'Workout Ready',
        color_palette: ['black', 'gray', 'neon_green'],
        fabric: 'performance_mesh',
        style_notes: 'Breathable activewear for exercise and movement',
        unlock_tier: 'free',
        mood_tags: ['energetic', 'motivated', 'active'],
        persona_affinity: ['athletic', 'health_conscious', 'energetic']
      },
      athletic_yoga: {
        outfit_id: 'athletic_yoga',
        type: 'athletic',
        name: 'Zen Flow',
        color_palette: ['lavender', 'white', 'soft_pink'],
        fabric: 'bamboo_blend',
        style_notes: 'Flexible and calming wear for mindful movement',
        unlock_tier: 'standard',
        mood_tags: ['peaceful', 'centered', 'mindful'],
        persona_affinity: ['peaceful', 'spiritual', 'balanced']
      },

      // Sleepwear
      sleepwear_basic: {
        outfit_id: 'sleepwear_basic',
        type: 'sleepwear',
        name: 'Cozy Comfort',
        color_palette: ['soft_blue', 'white', 'cream'],
        fabric: 'cotton',
        style_notes: 'Soft pajamas for restful sleep',
        unlock_tier: 'free',
        mood_tags: ['sleepy', 'relaxed', 'comfortable'],
        persona_affinity: ['gentle', 'nurturing', 'peaceful']
      },
      sleepwear_luxury: {
        outfit_id: 'sleepwear_luxury',
        type: 'sleepwear',
        name: 'Silken Dreams',
        color_palette: ['champagne', 'rose_gold', 'ivory'],
        fabric: 'silk',
        style_notes: 'Luxurious sleepwear for ultimate comfort',
        unlock_tier: 'premium',
        mood_tags: ['luxurious', 'pampered', 'serene'],
        persona_affinity: ['refined', 'luxury_loving', 'elegant']
      },

      // Fantasy Outfits
      fantasy_mystical: {
        outfit_id: 'fantasy_mystical',
        type: 'fantasy',
        name: 'Mystical Enchanter',
        color_palette: ['deep_purple', 'silver', 'midnight_blue'],
        fabric: 'ethereal_blend',
        style_notes: 'Flowing robes with magical charm',
        unlock_tier: 'premium',
        mood_tags: ['mysterious', 'magical', 'dreamy'],
        persona_affinity: ['mystical', 'imaginative', 'otherworldly']
      },
      fantasy_adventure: {
        outfit_id: 'fantasy_adventure',
        type: 'fantasy',
        name: 'Quest Ready',
        color_palette: ['forest_green', 'brown', 'gold'],
        fabric: 'leather_canvas',
        style_notes: 'Practical gear for epic adventures',
        unlock_tier: 'standard',
        mood_tags: ['adventurous', 'brave', 'excited'],
        persona_affinity: ['adventurous', 'brave', 'explorer']
      },

      // Seasonal Outfits
      winter_cozy: {
        outfit_id: 'winter_cozy',
        type: 'seasonal_winter',
        name: 'Winter Warmth',
        color_palette: ['burgundy', 'cream', 'forest_green'],
        fabric: 'wool',
        style_notes: 'Warm sweater and layers for cold weather',
        unlock_tier: 'free',
        mood_tags: ['cozy', 'warm', 'content'],
        persona_affinity: ['homebody', 'nurturing', 'seasonal']
      },
      summer_breeze: {
        outfit_id: 'summer_breeze',
        type: 'seasonal_summer',
        name: 'Summer Breeze',
        color_palette: ['sunny_yellow', 'coral', 'white'],
        fabric: 'linen',
        style_notes: 'Light and airy clothes for warm weather',
        unlock_tier: 'free',
        mood_tags: ['cheerful', 'free', 'sunny'],
        persona_affinity: ['cheerful', 'outdoorsy', 'vibrant']
      },

      // Basic Lingerie (Non-sexual default underlayer)
      lingerie_basic: {
        outfit_id: 'lingerie_basic',
        type: 'lingerie',
        name: 'Essential Comfort',
        color_palette: ['nude', 'white', 'black'],
        fabric: 'cotton_blend',
        style_notes: 'Comfortable everyday undergarments',
        unlock_tier: 'free',
        mood_tags: ['comfortable', 'natural', 'confident'],
        persona_affinity: ['practical', 'confident', 'comfortable']
      }
    };
  }

  /**
   * Assign default outfit based on persona and body configuration
   */
  assignDefaultOutfit(bodyConfig) {
    const defaultOutfitId = this.selectOutfitByPersona();
    const outfit = this.outfitLibrary[defaultOutfitId];
    
    if (!outfit) {
      throw new Error(`Default outfit ${defaultOutfitId} not found`);
    }

    // Customize colors based on persona preferences
    const customizedOutfit = this.customizeOutfitColors(outfit);
    
    // Create final outfit profile
    const outfitProfile = {
      ...customizedOutfit,
      bodyType: bodyConfig.bodyType,
      assignedAt: new Date().toISOString(),
      fitAdjustments: this.calculateFitAdjustments(bodyConfig)
    };

    this.wardrobeState.currentOutfit = outfitProfile;
    
    // Return updated config with outfit profile
    return {
      ...bodyConfig,
      outfit_profile: outfitProfile
    };
  }

  /**
   * Select outfit based on persona characteristics
   */
  selectOutfitByPersona() {
    const personaTraits = this.persona.traits || [];
    
    // Simple persona-based logic
    if (personaTraits.includes('professional')) return 'formal_professional';
    if (personaTraits.includes('artistic')) return 'casual_artistic';
    if (personaTraits.includes('athletic')) return 'athletic_basic';
    if (personaTraits.includes('mystical')) return 'fantasy_mystical';
    
    // Default to basic casual
    return 'casual_basic';
  }

  /**
   * Get outfit recommendation based on current mood
   */
  getOutfitByMood(mood) {
    const matchingOutfits = Object.values(this.outfitLibrary).filter(outfit => 
      outfit.mood_tags.includes(mood) && 
      this.wardrobeState.unlockedOutfits.includes(outfit.outfit_id)
    );

    if (matchingOutfits.length === 0) {
      return this.outfitLibrary['casual_basic']; // Fallback
    }

    // Return best match (first for simplicity, could be more sophisticated)
    return matchingOutfits[0];
  }

  /**
   * Unlock outfit using tokens or emotional bond
   */
  unlockOutfit(outfitId, method = 'token') {
    const outfit = this.outfitLibrary[outfitId];
    
    if (!outfit) {
      return { success: false, message: 'Outfit not found' };
    }

    if (this.wardrobeState.unlockedOutfits.includes(outfitId)) {
      return { success: false, message: 'Outfit already unlocked' };
    }

    let canUnlock = false;
    let cost = 0;

    switch (outfit.unlock_tier) {
      case 'free':
        canUnlock = true;
        break;
      case 'standard':
        if (method === 'token') {
          cost = 50;
          canUnlock = this.wardrobeState.tokens >= cost;
        } else if (method === 'bond') {
          canUnlock = this.wardrobeState.emotionalBond >= 25;
        }
        break;
      case 'premium':
        if (method === 'token') {
          cost = 150;
          canUnlock = this.wardrobeState.tokens >= cost;
        } else if (method === 'bond') {
          canUnlock = this.wardrobeState.emotionalBond >= 75;
        }
        break;
    }

    if (canUnlock) {
      this.wardrobeState.unlockedOutfits.push(outfitId);
      if (method === 'token') {
        this.wardrobeState.tokens -= cost;
      }
      return { success: true, message: `${outfit.name} unlocked!`, outfit };
    }

    return { 
      success: false, 
      message: `Insufficient ${method === 'token' ? 'tokens' : 'emotional bond'}` 
    };
  }

  /**
   * Customize outfit colors based on preferences
   */
  customizeOutfitColors(outfit) {
    const customizedOutfit = { ...outfit };
    
    // Simple color preference logic
    if (this.wardrobeState.favoriteColors.length > 0) {
      const favoriteColor = this.wardrobeState.favoriteColors[0];
      if (!outfit.color_palette.includes(favoriteColor)) {
        customizedOutfit.color_palette = [favoriteColor, ...outfit.color_palette.slice(1)];
      }
    }
    
    return customizedOutfit;
  }

  /**
   * Calculate fit adjustments based on body configuration
   */
  calculateFitAdjustments(bodyConfig) {
    return {
      size: bodyConfig.bodyType || 'medium',
      adjustments: {
        length: 'standard',
        width: 'standard',
        style: 'fitted'
      }
    };
  }

  /**
   * Get all unlocked outfits by category
   */
  getUnlockedOutfitsByType(type) {
    return this.wardrobeState.unlockedOutfits
      .map(id => this.outfitLibrary[id])
      .filter(outfit => outfit && outfit.type === type);
  }

  /**
   * Update emotional bond (affects outfit unlocks)
   */
  updateEmotionalBond(points) {
    this.wardrobeState.emotionalBond = Math.max(0, 
      Math.min(100, this.wardrobeState.emotionalBond + points));
  }

  /**
   * Add tokens for outfit purchases
   */
  addTokens(amount) {
    this.wardrobeState.tokens += amount;
  }

  /**
   * Export current wardrobe state as JSON
   */
  exportWardrobe() {
    return {
      wardrobeState: this.wardrobeState,
      currentOutfit: this.wardrobeState.currentOutfit,
      unlockedCount: this.wardrobeState.unlockedOutfits.length,
      totalOutfits: Object.keys(this.outfitLibrary).length,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import wardrobe state from JSON
   */
  importWardrobe(wardrobeData) {
    if (wardrobeData.wardrobeState) {
      this.wardrobeState = wardrobeData.wardrobeState;
      return { success: true, message: 'Wardrobe imported successfully' };
    }
    return { success: false, message: 'Invalid wardrobe data' };
  }

  /**
   * Get outfit recommendations based on multiple factors
   */
  getRecommendations(mood = null, occasion = null, weather = null) {
    let candidates = Object.values(this.outfitLibrary).filter(outfit =>
      this.wardrobeState.unlockedOutfits.includes(outfit.outfit_id)
    );

    // Filter by mood
    if (mood) {
      candidates = candidates.filter(outfit => outfit.mood_tags.includes(mood));
    }

    // Filter by occasion/type
    if (occasion) {
      candidates = candidates.filter(outfit => outfit.type === occasion);
    }

    // Weather-based filtering
    if (weather === 'cold') {
      candidates = candidates.filter(outfit => 
        outfit.type.includes('winter') || outfit.fabric === 'wool'
      );
    } else if (weather === 'hot') {
      candidates = candidates.filter(outfit => 
        outfit.type.includes('summer') || outfit.fabric === 'linen'
      );
    }

    return candidates.slice(0, 3); // Return top 3 recommendations
  }
}

module.exports = { OutfitDresser };