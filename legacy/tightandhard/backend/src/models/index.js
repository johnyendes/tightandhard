// Import all models
const Character = require('./Character');
const EmotionState = require('./EmotionState');
const BondingTier = require('./BondingTier');
const Memory = require('./Memory');
const MirrorLearning = require('./MirrorLearning');
const Outfit = require('./Outfit');
const Scene = require('./Scene');
const VoicePreset = require('./VoicePreset');
const CharacterImage = require('./CharacterImage');
const CharacterCampaign = require('./CharacterCampaign');

// Define associations
const setupAssociations = () => {
  // Character associations
  Character.associate({
    EmotionState,
    BondingTier,
    Memory,
    MirrorLearning,
    Outfit,
    Scene,
    VoicePreset,
    CharacterImage,
    CharacterCampaign
  });
  
  // EmotionState associations
  EmotionState.associate({ Character });
  
  // BondingTier associations
  BondingTier.associate({ Character });
  
  // Memory associations
  Memory.associate({ Character });
  
  // MirrorLearning associations
  MirrorLearning.associate({ Character });
  
  // Outfit associations
  Outfit.associate({ Character });
  
  // Scene associations
  Scene.associate({ Character });
  
  // VoicePreset associations
  VoicePreset.associate({ Character });
  
  // CharacterImage associations
  CharacterImage.associate({ Character });
  
  // CharacterCampaign associations
  CharacterCampaign.associate({});
};

module.exports = {
  Character,
  EmotionState,
  BondingTier,
  Memory,
  MirrorLearning,
  Outfit,
  Scene,
  VoicePreset,
  CharacterImage,
  CharacterCampaign,
  setupAssociations
};