/**
 * Persona Linker - Connects body configurations to suitable personas
 * Links anatomy with personality traits and voice preferences
 */

class PersonaLinker {
    constructor() {
        this.bodyToPersonaMap = new Map();
        this.personaProfiles = new Map();
        this.emotionalStates = ['calm', 'energetic', 'mysterious', 'playful', 'serious', 'warm', 'cool'];
        this.initializePersonaProfiles();
    }

    initializePersonaProfiles() {
        // Define persona profiles with traits and voice preferences
        const personas = [
            {
                id: 'confident_leader',
                name: 'Confident Leader',
                traits: ['assertive', 'charismatic', 'decisive'],
                bodyTypes: ['athletic', 'tall', 'strong'],
                emotionalRange: ['serious', 'warm', 'energetic'],
                voicePreferences: {
                    pitch: 'medium-low',
                    tone: 'authoritative',
                    pace: 'measured',
                    resonance: 'full'
                }
            },
            {
                id: 'gentle_nurturer',
                name: 'Gentle Nurturer',
                traits: ['empathetic', 'patient', 'caring'],
                bodyTypes: ['soft', 'average', 'graceful'],
                emotionalRange: ['warm', 'calm', 'playful'],
                voicePreferences: {
                    pitch: 'medium-high',
                    tone: 'soothing',
                    pace: 'gentle',
                    resonance: 'soft'
                }
            },
            {
                id: 'creative_dreamer',
                name: 'Creative Dreamer',
                traits: ['imaginative', 'artistic', 'introspective'],
                bodyTypes: ['slender', 'delicate', 'expressive'],
                emotionalRange: ['mysterious', 'playful', 'calm'],
                voicePreferences: {
                    pitch: 'variable',
                    tone: 'expressive',
                    pace: 'flowing',
                    resonance: 'light'
                }
            },
            {
                id: 'tech_innovator',
                name: 'Tech Innovator',
                traits: ['analytical', 'curious', 'precise'],
                bodyTypes: ['lean', 'focused', 'efficient'],
                emotionalRange: ['serious', 'energetic', 'cool'],
                voicePreferences: {
                    pitch: 'medium',
                    tone: 'clear',
                    pace: 'quick',
                    resonance: 'crisp'
                }
            },
            {
                id: 'wise_mentor',
                name: 'Wise Mentor',
                traits: ['experienced', 'thoughtful', 'patient'],
                bodyTypes: ['mature', 'distinguished', 'stable'],
                emotionalRange: ['calm', 'warm', 'serious'],
                voicePreferences: {
                    pitch: 'low',
                    tone: 'deep',
                    pace: 'deliberate',
                    resonance: 'rich'
                }
            },
            {
                id: 'energetic_explorer',
                name: 'Energetic Explorer',
                traits: ['adventurous', 'optimistic', 'dynamic'],
                bodyTypes: ['agile', 'compact', 'vibrant'],
                emotionalRange: ['energetic', 'playful', 'warm'],
                voicePreferences: {
                    pitch: 'high',
                    tone: 'bright',
                    pace: 'animated',
                    resonance: 'clear'
                }
            }
        ];

        personas.forEach(persona => {
            this.personaProfiles.set(persona.id, persona);
        });
    }

    // Link body configuration to suitable personas
    linkBodyToPersonas(bodyConfig) {
        const suitablePersonas = [];
        
        this.personaProfiles.forEach((persona, id) => {
            const compatibilityScore = this.calculateCompatibility(bodyConfig, persona);
            if (compatibilityScore > 0.3) {
                suitablePersonas.push({
                    id,
                    persona,
                    compatibility: compatibilityScore
                });
            }
        });

        // Sort by compatibility score
        return suitablePersonas.sort((a, b) => b.compatibility - a.compatibility);
    }

    calculateCompatibility(bodyConfig, persona) {
        let score = 0;
        let factors = 0;

        // Check body type compatibility
        if (bodyConfig.build && persona.bodyTypes.some(type => 
            this.isBodyTypeMatch(bodyConfig.build, type))) {
            score += 0.4;
        }
        factors++;

        // Check height compatibility
        if (bodyConfig.height && persona.bodyTypes.some(type => 
            this.isHeightMatch(bodyConfig.height, type))) {
            score += 0.3;
        }
        factors++;

        // Check overall aesthetic compatibility
        if (bodyConfig.style && this.isStyleMatch(bodyConfig.style, persona)) {
            score += 0.3;
        }
        factors++;

        return score / factors;
    }

    isBodyTypeMatch(build, personaType) {
        const buildMappings = {
            'muscular': ['athletic', 'strong'],
            'lean': ['lean', 'slender', 'agile'],
            'average': ['average', 'stable'],
            'curvy': ['soft', 'graceful'],
            'petite': ['delicate', 'compact']
        };

        return buildMappings[build]?.includes(personaType) || false;
    }

    isHeightMatch(height, personaType) {
        const heightMappings = {
            'tall': ['tall', 'distinguished'],
            'average': ['average', 'stable', 'efficient'],
            'short': ['compact', 'delicate']
        };

        return heightMappings[height]?.includes(personaType) || false;
    }

    isStyleMatch(style, persona) {
        const styleMappings = {
            'professional': ['confident_leader', 'tech_innovator', 'wise_mentor'],
            'casual': ['gentle_nurturer', 'energetic_explorer'],
            'artistic': ['creative_dreamer'],
            'athletic': ['energetic_explorer', 'confident_leader']
        };

        return styleMappings[style]?.includes(persona.id) || false;
    }

    // Get recommended emotional state based on persona and context
    getRecommendedEmotionalState(personaId, context = 'default') {
        const persona = this.personaProfiles.get(personaId);
        if (!persona) return 'calm';

        const contextMappings = {
            'meeting': ['serious', 'warm'],
            'social': ['playful', 'energetic', 'warm'],
            'creative': ['mysterious', 'playful'],
            'relaxed': ['calm', 'cool'],
            'default': persona.emotionalRange
        };

        const availableStates = contextMappings[context] || persona.emotionalRange;
        const compatibleStates = availableStates.filter(state => 
            persona.emotionalRange.includes(state));

        return compatibleStates[0] || persona.emotionalRange[0];
    }
}

module.exports = { PersonaLinker };