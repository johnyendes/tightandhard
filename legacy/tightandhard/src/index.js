const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Import services
const { PersonaLinker } = require('./services/persona_linker');
const { VoiceSelector } = require('./services/voice_selector');
const OutfitDresser = require('./services/outfit_dresser');
const { EmotionEngine, EmotionalState, EventType } = require('./services/emotion_engine');

// Import adult routes
const adultRoutes = require('./routes/adult_routes');

// Initialize services
const personaLinker = new PersonaLinker();
const voiceSelector = new VoiceSelector();

// Store active sessions (in production, use Redis or similar)
const activeSessions = new Map();

// Mount adult routes
app.use('/api/adult', adultRoutes);

// ===== Routes =====

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve adult dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/adult_dashboard.html'));
});

// Get available personas
app.get('/api/personas', (req, res) => {
    const personas = Array.from(personaLinker.personaProfiles.values());
    res.json({ personas });
});

// Get available voices
app.get('/api/voices', (req, res) => {
    const voices = Array.from(voiceSelector.voiceProfiles.values());
    res.json({ voices });
});

// Get outfit library
app.get('/api/outfits', (req, res) => {
    const tempPersona = { traits: [] };
    const dresser = new OutfitDresser(tempPersona);
    res.json({ outfits: dresser.outfitLibrary });
});

// Link body configuration to personas
app.post('/api/link-body-to-personas', (req, res) => {
    try {
        const { bodyConfig } = req.body;
        const suitablePersonas = personaLinker.linkBodyToPersonas(bodyConfig);
        res.json({ suitablePersonas });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Select voice for persona
app.post('/api/select-voice', (req, res) => {
    try {
        const { personaId, emotionalState, preferences } = req.body;
        const selectedVoice = voiceSelector.selectVoice(personaId, emotionalState, preferences);
        res.json({ selectedVoice });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create new companion session
app.post('/api/session', (req, res) => {
    try {
        const { bodyConfig, personaId, name } = req.body;
        const sessionId = `session_${Date.now()}`;
        
        // Initialize personality
        const persona = personaLinker.personaProfiles.get(personaId) || 
            personaLinker.personaProfiles.get('gentle_nurturer');
        
        const personality = {
            sweet: 0.7,
            shy: 0.4,
            dominant: 0.3,
            ambitious: 0.5,
            playful: 0.6,
            sensitive: 0.5
        };

        // Initialize emotion engine
        const emotionEngine = new EmotionEngine(personality);
        
        // Initialize outfit dresser
        const dresser = new OutfitDresser({ traits: persona.traits || [] });
        
        // Assign default outfit
        const configWithOutfit = dresser.assignDefaultOutfit(bodyConfig);
        
        // Store session
        const session = {
            id: sessionId,
            name: name || 'Ava',
            bodyConfig: configWithOutfit,
            persona,
            personality,
            emotionEngine,
            outfitDresser: dresser,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        
        activeSessions.set(sessionId, session);
        
        res.json({ 
            sessionId, 
            message: 'Companion created successfully',
            companion: {
                id: sessionId,
                name: session.name,
                bodyConfig: session.bodyConfig,
                persona: session.persona,
                emotionalState: emotionEngine.getEmotionalState(),
                outfit: session.bodyConfig.outfit_profile
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get session status
app.get('/api/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
        sessionId: session.id,
        name: session.name,
        persona: session.persona,
        emotionalState: session.emotionEngine.getEmotionalState(),
        outfit: session.bodyConfig.outfit_profile,
        createdAt: session.createdAt,
        lastActive: session.lastActive
    });
});

// Process emotional event
app.post('/api/session/:sessionId/event', (req, res) => {
    const { sessionId } = req.params;
    const { type, intensity, context } = req.body;
    
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    try {
        const event = {
            type: EventType[type.toUpperCase()] || type,
            intensity: intensity || 1.0,
            context: context || {},
            timestamp: Date.now()
        };
        
        session.emotionEngine.processEvent(event);
        session.lastActive = new Date().toISOString();
        
        // Get suggestions
        const suggestions = session.emotionEngine.getSuggestions();
        
        res.json({
            success: true,
            emotionalState: session.emotionEngine.getEmotionalState(),
            suggestions
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Change outfit
app.post('/api/session/:sessionId/outfit', (req, res) => {
    const { sessionId } = req.params;
    const { outfitId } = req.body;
    
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    try {
        // Check if outfit is unlocked
        const unlockResult = session.outfitDresser.unlockOutfit(outfitId, 'bond');
        
        if (unlockResult.success) {
            // Apply outfit
            session.outfitDresser.currentOutfit = unlockResult.outfit.type;
            session.emotionEngine.setOutfit(unlockResult.outfit.type);
            
            res.json({
                success: true,
                outfit: unlockResult.outfit,
                emotionalState: session.emotionEngine.getEmotionalState()
            });
        } else {
            res.status(400).json({ success: false, message: unlockResult.message });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unlock outfit
app.post('/api/session/:sessionId/unlock-outfit', (req, res) => {
    const { sessionId } = req.params;
    const { outfitId, method } = req.body;
    
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    try {
        const unlockResult = session.outfitDresser.unlockOutfit(outfitId, method || 'token');
        res.json(unlockResult);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get outfit recommendations
app.get('/api/session/:sessionId/recommendations', (req, res) => {
    const { sessionId } = req.params;
    const { mood, occasion, weather } = req.query;
    
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    try {
        const recommendations = session.outfitDresser.getRecommendations(
            mood, occasion, weather
        );
        res.json({ recommendations });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Export model
app.post('/api/session/:sessionId/export', (req, res) => {
    const { sessionId } = req.params;
    const { format } = req.body;
    
    const session = activeSessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    try {
        const exportData = {
            model_id: session.id,
            name: session.name,
            created_at: session.createdAt,
            version: '1.0.0',
            bodyConfig: session.bodyConfig,
            persona: session.persona,
            emotionalState: session.emotionEngine.getEmotionalState(),
            outfit: session.bodyConfig.outfit_profile,
            wardrobe: session.outfitDresser.exportWardrobe(),
            exportedAt: new Date().toISOString()
        };
        
        if (format === 'json') {
            res.json({ success: true, data: exportData });
        } else {
            res.json({ success: true, data: exportData });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// List active sessions
app.get('/api/sessions', (req, res) => {
    const sessions = Array.from(activeSessions.values()).map(session => ({
        id: session.id,
        name: session.name,
        persona: session.persona.name,
        createdAt: session.createdAt,
        lastActive: session.lastActive,
        bondLevel: session.emotionEngine.getEmotionalState().bondLevel
    }));
    
    res.json({ sessions });
});

// Delete session
app.delete('/api/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (activeSessions.delete(sessionId)) {
        res.json({ success: true, message: 'Session deleted' });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/body_constructor.html'));
});

// ===== Start Server =====
app.listen(PORT, () => {
    console.log(`
    🚀 TightandHard AI Companion System
    =====================================
    Server running on http://localhost:${PORT}
    
    Available endpoints:
    - GET  /api/health
    - GET  /api/personas
    - GET  /api/voices  
    - GET  /api/outfits
    - POST /api/link-body-to-personas
    - POST /api/select-voice
    - POST /api/session
    - GET  /api/session/:sessionId
    - POST /api/session/:sessionId/event
    - POST /api/session/:sessionId/outfit
    - POST /api/session/:sessionId/unlock-outfit
    - GET  /api/session/:sessionId/recommendations
    - POST /api/session/:sessionId/export
    - GET  /api/sessions
    - DELETE /api/session/:sessionId
    `);
});