/**
 * Emotion Engine - Emotional Behavior Engine for AI Dolls
 * Handles emotional states, bonding, and mood-based behaviors
 */

// Emotional states available to the doll
const EmotionalState = {
  HAPPY: 'happy',
  RELAXED: 'relaxed',
  FLIRTY: 'flirty',
  SHY: 'shy',
  CURIOUS: 'curious',
  UPSET: 'upset',
  EXCITED: 'excited',
  JEALOUS: 'jealous',
  SLEEPY: 'sleepy',
  ROMANTIC: 'romantic'
};

// Types of events that can trigger emotional changes
const EventType = {
  COMPLIMENT: 'compliment',
  TOUCH: 'touch',
  OUTFIT_CHANGE: 'outfit_change',
  SCENE_CHANGE: 'scene_change',
  GIFT_RECEIVED: 'gift_received',
  IGNORED: 'ignored',
  PRAISED: 'praised',
  CRITICIZED: 'criticized',
  PLAYED_WITH: 'played_with',
  TIME_PASSED: 'time_passed'
};

class EmotionEngine {
  // Core emotional state
  constructor(personality, config = {}, initialBond = 50) {
    this.currentStates = {};
    this.dominantEmotion = EmotionalState.RELAXED;
    this.bondLevel = Math.max(0, Math.min(100, initialBond));
    
    // Configuration and traits
    this.personality = personality;
    this.config = {
      baseStates: {
        [EmotionalState.HAPPY]: 0.6,
        [EmotionalState.RELAXED]: 0.8,
        [EmotionalState.FLIRTY]: 0.2,
        [EmotionalState.SHY]: 0.4,
        [EmotionalState.CURIOUS]: 0.5,
        [EmotionalState.UPSET]: 0.1,
        [EmotionalState.EXCITED]: 0.3,
        [EmotionalState.JEALOUS]: 0.0,
        [EmotionalState.SLEEPY]: 0.2,
        [EmotionalState.ROMANTIC]: 0.3
      },
      decayRate: 0.95,
      bondInfluence: 0.3,
      personalityInfluence: 0.4,
      timeInfluence: 0.2,
      outfitInfluence: 0.25,
      ...config
    };
    
    // State tracking
    this.recentEvents = [];
    this.currentOutfit = 'casual';
    this.currentScene = 'bedroom';
    this.lastInteraction = Date.now();
    this.sceneOverride = null;
    this.hooks = [];
    
    // Default outfit influences
    this.outfitInfluences = {
      casual: {
        [EmotionalState.RELAXED]: 0.3,
        [EmotionalState.HAPPY]: 0.2
      },
      formal: {
        [EmotionalState.SHY]: 0.2,
        [EmotionalState.CURIOUS]: 0.1
      },
      cute: {
        [EmotionalState.HAPPY]: 0.4,
        [EmotionalState.EXCITED]: 0.3,
        [EmotionalState.SHY]: 0.2
      },
      sexy: {
        [EmotionalState.FLIRTY]: 0.5,
        [EmotionalState.ROMANTIC]: 0.3,
        [EmotionalState.SHY]: -0.2
      },
      sporty: {
        [EmotionalState.EXCITED]: 0.4,
        [EmotionalState.HAPPY]: 0.3,
        [EmotionalState.SLEEPY]: -0.2
      },
      sleepwear: {
        [EmotionalState.SLEEPY]: 0.6,
        [EmotionalState.RELAXED]: 0.4,
        [EmotionalState.ROMANTIC]: 0.2
      }
    };

    // Default time modifiers
    this.timeModifiers = {
      morning: {
        [EmotionalState.EXCITED]: 0.2,
        [EmotionalState.CURIOUS]: 0.3,
        [EmotionalState.SLEEPY]: -0.4
      },
      afternoon: {
        [EmotionalState.HAPPY]: 0.2,
        [EmotionalState.RELAXED]: 0.1
      },
      evening: {
        [EmotionalState.ROMANTIC]: 0.3,
        [EmotionalState.FLIRTY]: 0.2,
        [EmotionalState.RELAXED]: 0.3
      },
      night: {
        [EmotionalState.SLEEPY]: 0.5,
        [EmotionalState.ROMANTIC]: 0.2,
        [EmotionalState.EXCITED]: -0.3
      }
    };
    
    // Initialize emotional states
    this.initializeEmotionalStates();
    this.updateDominantEmotion();
  }

  /**
   * Initialize emotional states based on personality and base configuration
   */
  initializeEmotionalStates() {
    Object.values(EmotionalState).forEach(state => {
      let baseValue = this.config.baseStates[state] || 0;
      
      // Apply personality influences
      baseValue += this.getPersonalityInfluence(state);
      
      this.currentStates[state] = Math.max(0, Math.min(1, baseValue));
    });
  }

  /**
   * Get personality influence on a specific emotional state
   */
  getPersonalityInfluence(state) {
    const influence = this.config.personalityInfluence;
    
    switch (state) {
      case EmotionalState.HAPPY:
        return (this.personality.sweet + this.personality.playful) * influence * 0.3;
      case EmotionalState.SHY:
        return this.personality.shy * influence * 0.5;
      case EmotionalState.FLIRTY:
        return (this.personality.dominant + (1 - this.personality.shy)) * influence * 0.3;
      case EmotionalState.EXCITED:
        return (this.personality.playful + this.personality.ambitious) * influence * 0.4;
      case EmotionalState.UPSET:
        return this.personality.sensitive * influence * 0.2;
      case EmotionalState.ROMANTIC:
        return (this.personality.sweet + (1 - this.personality.shy)) * influence * 0.3;
      case EmotionalState.JEALOUS:
        return (this.personality.sensitive + this.personality.dominant) * influence * 0.2;
      default:
        return 0;
    }
  }

  /**
   * Process an emotional event and update states
   */
  processEvent(event) {
    this.recentEvents.push(event);
    this.lastInteraction = event.timestamp;
    
    // Keep only recent events (last 10 minutes)
    const cutoff = Date.now() - 10 * 60 * 1000;
    this.recentEvents = this.recentEvents.filter(e => e.timestamp > cutoff);
    
    // Apply event effects
    this.applyEventEffects(event);
    this.updateBondLevel(event);
    this.updateEmotionalStates();
    
    this.emitHooks();
  }

  /**
   * Apply specific event effects to emotional states
   */
  applyEventEffects(event) {
    const intensity = event.intensity;
    
    switch (event.type) {
      case EventType.COMPLIMENT:
        this.adjustEmotion(EmotionalState.HAPPY, 0.3 * intensity);
        this.adjustEmotion(EmotionalState.SHY, 0.1 * intensity * this.personality.shy);
        this.adjustEmotion(EmotionalState.FLIRTY, 0.2 * intensity * (1 - this.personality.shy));
        break;
        
      case EventType.TOUCH:
        this.adjustEmotion(EmotionalState.HAPPY, 0.2 * intensity);
        this.adjustEmotion(EmotionalState.ROMANTIC, 0.3 * intensity);
        this.adjustEmotion(EmotionalState.SHY, 0.1 * intensity * this.personality.shy);
        break;
        
      case EventType.GIFT_RECEIVED:
        this.adjustEmotion(EmotionalState.EXCITED, 0.4 * intensity);
        this.adjustEmotion(EmotionalState.HAPPY, 0.5 * intensity);
        break;
        
      case EventType.IGNORED:
        this.adjustEmotion(EmotionalState.UPSET, 0.3 * intensity);
        this.adjustEmotion(EmotionalState.JEALOUS, 0.2 * intensity * this.personality.sensitive);
        this.adjustEmotion(EmotionalState.HAPPY, -0.2 * intensity);
        break;
        
      case EventType.PLAYED_WITH:
        this.adjustEmotion(EmotionalState.EXCITED, 0.3 * intensity);
        this.adjustEmotion(EmotionalState.HAPPY, 0.4 * intensity);
        this.adjustEmotion(EmotionalState.PLAYFUL, 0.3 * intensity);
        break;
        
      case EventType.CRITICIZED:
        this.adjustEmotion(EmotionalState.UPSET, 0.4 * intensity);
        this.adjustEmotion(EmotionalState.SHY, 0.2 * intensity);
        this.adjustEmotion(EmotionalState.HAPPY, -0.3 * intensity);
        break;
    }
  }

  /**
   * Update bond level based on event
   */
  updateBondLevel(event) {
    let bondChange = 0;
    
    switch (event.type) {
      case EventType.COMPLIMENT:
      case EventType.GIFT_RECEIVED:
      case EventType.PLAYED_WITH:
        bondChange = 2 * event.intensity;
        break;
      case EventType.TOUCH:
        bondChange = 1.5 * event.intensity;
        break;
      case EventType.IGNORED:
        bondChange = -1 * event.intensity;
        break;
      case EventType.CRITICIZED:
        bondChange = -3 * event.intensity;
        break;
    }
    
    const oldBond = this.bondLevel;
    this.bondLevel = Math.max(0, Math.min(100, this.bondLevel + bondChange));
    
    // Emit bond change hook
    if (oldBond !== this.bondLevel) {
      this.hooks.forEach(hook => hook.onBondChange?.(oldBond, this.bondLevel));
    }
  }

  /**
   * Adjust a specific emotion value
   */
  adjustEmotion(state, change) {
    this.currentStates[state] = Math.max(0, Math.min(1, this.currentStates[state] + change));
  }

  /**
   * Update all emotional states with modifiers
   */
  updateEmotionalStates() {
    const oldDominant = this.dominantEmotion;
    
    // Apply time-based modifiers
    this.applyTimeModifiers();
    
    // Apply outfit influences
    this.applyOutfitInfluences();
    
    // Apply bond influences
    this.applyBondInfluences();
    
    // Apply scene overrides if any
    if (this.sceneOverride) {
      Object.entries(this.sceneOverride).forEach(([state, value]) => {
        if (value !== undefined) {
          this.currentStates[state] = Math.max(0, Math.min(1, value));
        }
      });
    }
    
    // Natural decay over time
    this.applyEmotionalDecay();
    
    // Update dominant emotion
    this.updateDominantEmotion();
    
    // Emit change hooks if dominant emotion changed
    if (oldDominant !== this.dominantEmotion) {
      const intensity = this.currentStates[this.dominantEmotion];
      this.hooks.forEach(hook => hook.onEmotionChange?.(oldDominant, this.dominantEmotion, intensity));
    }
  }

  /**
   * Apply time-of-day modifiers
   */
  applyTimeModifiers() {
    const hour = new Date().getHours();
    let timeKey;
    
    if (hour >= 6 && hour < 12) timeKey = 'morning';
    else if (hour >= 12 && hour < 17) timeKey = 'afternoon';
    else if (hour >= 17 && hour < 22) timeKey = 'evening';
    else timeKey = 'night';
    
    const modifiers = this.timeModifiers[timeKey];
    Object.entries(modifiers).forEach(([state, modifier]) => {
      if (modifier !== undefined) {
        this.adjustEmotion(state, modifier * this.config.timeInfluence);
      }
    });
  }

  /**
   * Apply outfit-based influences
   */
  applyOutfitInfluences() {
    const influences = this.outfitInfluences[this.currentOutfit];
    
    if (influences) {
      Object.entries(influences).forEach(([state, modifier]) => {
        if (modifier !== undefined) {
          this.adjustEmotion(state, modifier * this.config.outfitInfluence);
        }
      });
    }
  }

  /**
   * Apply bond level influences on emotions
   */
  applyBondInfluences() {
    const bondMultiplier = this.bondLevel / 100;
    const influence = this.config.bondInfluence;
    
    // High bond increases positive emotions
    this.adjustEmotion(EmotionalState.HAPPY, bondMultiplier * influence * 0.2);
    this.adjustEmotion(EmotionalState.ROMANTIC, bondMultiplier * influence * 0.15);
    this.adjustEmotion(EmotionalState.RELAXED, bondMultiplier * influence * 0.1);
    
    // Low bond increases negative emotions
    const lowBondMultiplier = (100 - this.bondLevel) / 100;
    this.adjustEmotion(EmotionalState.UPSET, lowBondMultiplier * influence * 0.1);
    this.adjustEmotion(EmotionalState.SHY, lowBondMultiplier * influence * 0.05);
  }

  /**
   * Apply natural emotional decay over time
   */
  applyEmotionalDecay() {
    Object.values(EmotionalState).forEach(state => {
      const baseValue = this.config.baseStates[state] || 0;
      const current = this.currentStates[state];
      
      // Gradually return to base state
      const diff = baseValue - current;
      this.currentStates[state] += diff * (1 - this.config.decayRate);
    });
  }

  /**
   * Update the dominant emotional state
   */
  updateDominantEmotion() {
    let maxValue = 0;
    let dominantState = EmotionalState.RELAXED;
    
    Object.entries(this.currentStates).forEach(([state, value]) => {
      if (value > maxValue) {
        maxValue = value;
        dominantState = state;
      }
    });
    
    this.dominantEmotion = dominantState;
  }

  /**
   * Emit hooks to notify behavior systems
   */
  emitHooks() {
    this.hooks.forEach(hook => hook.onMoodShift?.(this.currentStates));
  }

  // Public API Methods

  /**
   * Set the current outfit and trigger emotional updates
   */
  setOutfit(outfitType) {
    this.currentOutfit = outfitType;
    this.processEvent({
      type: EventType.OUTFIT_CHANGE,
      intensity: 0.3,
      context: { outfit: outfitType },
      timestamp: Date.now()
    });
  }

  /**
   * Change the current scene and trigger updates
   */
  setScene(sceneName) {
    this.currentScene = sceneName;
    this.processEvent({
      type: EventType.SCENE_CHANGE,
      intensity: 0.2,
      context: { scene: sceneName },
      timestamp: Date.now()
    });
  }

  /**
   * Override emotions for scripted scenes
   */
  setSceneOverride(overrides) {
    this.sceneOverride = overrides;
    this.updateEmotionalStates();
  }

  /**
   * Register an emotion hook for behavior systems
   */
  addHook(hook) {
    this.hooks.push(hook);
  }

  /**
   * Remove an emotion hook
   */
  removeHook(hook) {
    const index = this.hooks.indexOf(hook);
    if (index > -1) {
      this.hooks.splice(index, 1);
    }
  }

  /**
   * Get current emotional state information
   */
  getEmotionalState() {
    return {
      dominant: this.dominantEmotion,
      intensity: this.currentStates[this.dominantEmotion],
      allStates: { ...this.currentStates },
      bondLevel: this.bondLevel
    };
  }

  /**
   * Get suggestions based on current emotional state
   */
  getSuggestions() {
    const dominant = this.dominantEmotion;
    const intensity = this.currentStates[dominant];
    
    let voiceTone = 'neutral';
    let outfitSuggestion;
    let activitySuggestion = 'chat';
    
    switch (dominant) {
      case EmotionalState.HAPPY:
        voiceTone = intensity > 0.7 ? 'cheerful' : 'warm';
        activitySuggestion = 'play games';
        break;
      case EmotionalState.FLIRTY:
        voiceTone = 'playful';
        outfitSuggestion = 'sexy';
        activitySuggestion = 'romantic conversation';
        break;
      case EmotionalState.SHY:
        voiceTone = 'soft';
        outfitSuggestion = 'cute';
        activitySuggestion = 'quiet time together';
        break;
      case EmotionalState.EXCITED:
        voiceTone = 'energetic';
        outfitSuggestion = 'sporty';
        activitySuggestion = 'active play';
        break;
      case EmotionalState.SLEEPY:
        voiceTone = 'drowsy';
        outfitSuggestion = 'sleepwear';
        activitySuggestion = 'rest together';
        break;
      case EmotionalState.ROMANTIC:
        voiceTone = 'intimate';
        outfitSuggestion = 'formal';
        activitySuggestion = 'romantic activities';
        break;
    }
    
    return { voiceTone, outfitSuggestion, activitySuggestion };
  }

  /**
   * Force update the emotion engine (useful for time-based updates)
   */
  tick() {
    this.updateEmotionalStates();
  }

  /**
   * Reset emotions to base state
   */
  reset() {
    this.initializeEmotionalStates();
    this.updateDominantEmotion();
    this.sceneOverride = null;
    this.recentEvents = [];
  }
}

module.exports = { EmotionEngine, EmotionalState, EventType };