/**
 * Voice Selector - Selects and configures voice profiles for AI companions
 * Links persona characteristics with appropriate voice settings
 */

class VoiceSelector {
    constructor() {
        this.voiceProfiles = new Map();
        this.emotionalModifiers = new Map();
        this.initializeVoiceProfiles();
        this.initializeEmotionalModifiers();
    }

    initializeVoiceProfiles() {
        const voices = [
            {
                id: 'authority_bass',
                name: 'Authority Bass',
                characteristics: {
                    pitch: 'low',
                    tone: 'authoritative',
                    pace: 'measured',
                    resonance: 'rich'
                },
                suitablePersonas: ['confident_leader', 'wise_mentor'],
                emotionalRange: ['serious', 'warm', 'calm']
            },
            {
                id: 'warm_alto',
                name: 'Warm Alto',
                characteristics: {
                    pitch: 'medium',
                    tone: 'soothing',
                    pace: 'gentle',
                    resonance: 'soft'
                },
                suitablePersonas: ['gentle_nurturer', 'wise_mentor'],
                emotionalRange: ['warm', 'calm', 'playful']
            },
            {
                id: 'bright_soprano',
                name: 'Bright Soprano',
                characteristics: {
                    pitch: 'high',
                    tone: 'bright',
                    pace: 'animated',
                    resonance: 'clear'
                },
                suitablePersonas: ['energetic_explorer', 'creative_dreamer'],
                emotionalRange: ['energetic', 'playful', 'warm']
            },
            {
                id: 'tech_neutral',
                name: 'Tech Neutral',
                characteristics: {
                    pitch: 'medium',
                    tone: 'clear',
                    pace: 'quick',
                    resonance: 'crisp'
                },
                suitablePersonas: ['tech_innovator'],
                emotionalRange: ['serious', 'energetic', 'cool']
            },
            {
                id: 'expressive_tenor',
                name: 'Expressive Tenor',
                characteristics: {
                    pitch: 'medium-high',
                    tone: 'expressive',
                    pace: 'flowing',
                    resonance: 'light'
                },
                suitablePersonas: ['creative_dreamer', 'energetic_explorer'],
                emotionalRange: ['mysterious', 'playful', 'energetic']
            },
            {
                id: 'confident_baritone',
                name: 'Confident Baritone',
                characteristics: {
                    pitch: 'medium-low',
                    tone: 'confident',
                    pace: 'steady',
                    resonance: 'full'
                },
                suitablePersonas: ['confident_leader', 'tech_innovator'],
                emotionalRange: ['serious', 'energetic', 'warm']
            }
        ];

        voices.forEach(voice => {
            this.voiceProfiles.set(voice.id, voice);
        });
    }

    initializeEmotionalModifiers() {
        const modifiers = {
            'calm': {
                pitchAdjustment: 0,
                paceMultiplier: 0.8,
                toneShift: 'relaxed',
                resonanceBoost: 0.1
            },
            'energetic': {
                pitchAdjustment: 0.2,
                paceMultiplier: 1.3,
                toneShift: 'vibrant',
                resonanceBoost: 0.2
            },
            'mysterious': {
                pitchAdjustment: -0.1,
                paceMultiplier: 0.7,
                toneShift: 'sultry',
                resonanceBoost: -0.1
            },
            'playful': {
                pitchAdjustment: 0.1,
                paceMultiplier: 1.1,
                toneShift: 'light',
                resonanceBoost: 0
            },
            'serious': {
                pitchAdjustment: -0.1,
                paceMultiplier: 0.9,
                toneShift: 'focused',
                resonanceBoost: 0.1
            },
            'warm': {
                pitchAdjustment: 0,
                paceMultiplier: 1.0,
                toneShift: 'friendly',
                resonanceBoost: 0.2
            },
            'cool': {
                pitchAdjustment: 0,
                paceMultiplier: 1.0,
                toneShift: 'neutral',
                resonanceBoost: -0.1
            }
        };

        Object.entries(modifiers).forEach(([emotion, modifier]) => {
            this.emotionalModifiers.set(emotion, modifier);
        });
    }

    // Select voice based on persona and emotional state
    selectVoice(personaId, emotionalState = 'calm', preferences = {}) {
        const suitableVoices = [];

        this.voiceProfiles.forEach((voice, voiceId) => {
            if (voice.suitablePersonas.includes(personaId)) {
                const compatibility = this.calculateVoiceCompatibility(
                    voice, emotionalState, preferences
                );
                suitableVoices.push({
                    id: voiceId,
                    voice,
                    compatibility,
                    modifiedCharacteristics: this.applyEmotionalModifiers(
                        voice.characteristics, emotionalState
                    )
                });
            }
        });

        // Sort by compatibility and return best match
        suitableVoices.sort((a, b) => b.compatibility - a.compatibility);
        return suitableVoices[0] || this.getDefaultVoice();
    }

    calculateVoiceCompatibility(voice, emotionalState, preferences) {
        let score = 1.0;

        // Check emotional state compatibility
        if (!voice.emotionalRange.includes(emotionalState)) {
            score *= 0.7;
        }

        // Apply user preferences
        if (preferences.preferredPitch && preferences.preferredPitch !== voice.characteristics.pitch) {
            score *= 0.8;
        }

        if (preferences.preferredTone && preferences.preferredTone !== voice.characteristics.tone) {
            score *= 0.8;
        }

        if (preferences.preferredPace && preferences.preferredPace !== voice.characteristics.pace) {
            score *= 0.8;
        }

        return score;
    }

    applyEmotionalModifiers(baseCharacteristics, emotionalState) {
        const modifier = this.emotionalModifiers.get(emotionalState);
        if (!modifier) return baseCharacteristics;

        return {
            ...baseCharacteristics,
            pitchLevel: this.adjustPitch(baseCharacteristics.pitch, modifier.pitchAdjustment),
            pace: this.adjustPace(baseCharacteristics.pace, modifier.paceMultiplier),
            tone: modifier.toneShift,
            resonance: this.adjustResonance(baseCharacteristics.resonance, modifier.resonanceBoost)
        };
    }

    adjustPitch(basePitch, adjustment) {
        const pitchScale = ['very-low', 'low', 'medium-low', 'medium', 'medium-high', 'high', 'very-high'];
        const currentIndex = pitchScale.indexOf(basePitch);
        const newIndex = Math.max(0, Math.min(pitchScale.length - 1, 
            currentIndex + Math.round(adjustment * 2)));
        return pitchScale[newIndex];
    }

    adjustPace(basePace, multiplier) {
        const paceMap = {
            'very-slow': 0.5,
            'slow': 0.7,
            'deliberate': 0.8,
            'gentle': 0.9,
            'measured': 1.0,
            'steady': 1.1,
            'quick': 1.3,
            'animated': 1.5,
            'rapid': 1.7
        };

        const currentSpeed = paceMap[basePace] || 1.0;
        const newSpeed = currentSpeed * multiplier;

        // Find closest pace
        const closestPace = Object.entries(paceMap).reduce((prev, [pace, speed]) => {
            return Math.abs(speed - newSpeed) < Math.abs(paceMap[prev] - newSpeed) ? pace : prev;
        }, 'measured');

        return closestPace;
    }

    adjustResonance(baseResonance, boost) {
        const resonanceMap = {
            'thin': 0.2,
            'light': 0.4,
            'soft': 0.6,
            'clear': 0.7,
            'full': 0.8,
            'rich': 0.9,
            'deep': 1.0
        };

        const currentLevel = resonanceMap[baseResonance] || 0.7;
        const newLevel = Math.max(0.1, Math.min(1.0, currentLevel + boost));

        const closestResonance = Object.entries(resonanceMap).reduce((prev, [resonance, level]) => {
            return Math.abs(level - newLevel) < Math.abs(resonanceMap[prev] - newLevel) ? resonance : prev;
        }, 'clear');

        return closestResonance;
    }

    getDefaultVoice() {
        return {
            id: 'warm_alto',
            voice: this.voiceProfiles.get('warm_alto'),
            compatibility: 0.5,
            modifiedCharacteristics: this.voiceProfiles.get('warm_alto').characteristics
        };
    }

    // Get voice preview with emotional state applied
    getVoicePreview(voiceId, emotionalState = 'calm') {
        const voice = this.voiceProfiles.get(voiceId);
        if (!voice) return null;

        return {
            baseVoice: voice,
            emotionalState,
            modifiedCharacteristics: this.applyEmotionalModifiers(
                voice.characteristics, emotionalState
            ),
            sampleText: this.generateSampleText(voice, emotionalState)
        };
    }

    generateSampleText(voice, emotionalState) {
        const samples = {
            'calm': "Hello, I'm here to help you with whatever you need.",
            'energetic': "Hi there! I'm excited to work with you today!",
            'mysterious': "Greetings... I have some interesting ideas to share.",
            'playful': "Hey! Ready to have some fun with this project?",
            'serious': "Good day. Let's focus on getting this done right.",
            'warm': "Hello friend, I'm so glad we're working together.",
            'cool': "Hello. I'm ready to assist you professionally."
        };

        return samples[emotionalState] || samples['calm'];
    }
}

module.exports = { VoiceSelector };