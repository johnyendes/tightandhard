# AI Companion Platform - Frontend

A Next.js 14 frontend application for the AI Companion platform, featuring real-time interactions, emotional bonding, and character customization.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with Lucide icons
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast

## Features

### Core Pages

1. **Authentication**
   - Login page with form validation
   - Registration page with password confirmation
   - Protected routes with auth checks

2. **Companion Builder** (`/builder`)
   - Three-step wizard for creating AI companions
   - Basic information setup
   - Personality trait selection
   - Appearance customization
   - Live preview panel

3. **Bonding Dashboard** (`/bonding`)
   - Real-time bond level tracking
   - Trust score visualization
   - Intimacy level indicators
   - Shared memories display
   - Bonding timeline

4. **Memory System** (`/memories`)
   - Memory gallery with search and filters
   - Core memories highlighting
   - Memory importance levels
   - Tag-based organization
   - Memory creation interface

5. **Scene Gallery** (`/scenes`)
   - Scene preview cards
   - Category-based filtering
   - Locked/unlocked status
   - Scene activation
   - Usage statistics

6. **Voice Studio** (`/voice`)
   - Voice preset selection
   - Real-time parameter adjustment
   - Voice preview playback
   - Emotional modulation
   - Tone and pitch customization

7. **Wardrobe** (`/outfits`)
   - Outfit gallery with categories
   - Lock/unlock mechanics
   - Color customization
   - Mood effects display
   - Outfit activation

## Project Structure

```
frontend/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   └── Sidebar.tsx         # Navigation sidebar
│   └── ui/
│       ├── Button.tsx          # Reusable button component
│       ├── Card.tsx            # Card container
│       ├── Input.tsx           # Form input
│       ├── Badge.tsx           # Status badges
│       └── LoadingSpinner.tsx  # Loading indicator
├── hooks/
│   ├── useSocket.ts            # WebSocket connection
│   └── useBonding.ts           # Bonding data hook
├── lib/
│   ├── api.ts                  # Axios client with interceptors
│   └── utils.ts                # Utility functions
├── pages/
│   ├── _app.tsx                # App wrapper
│   ├── _document.tsx           # Document structure
│   ├── login.tsx               # Login page
│   ├── register.tsx            # Registration page
│   ├── builder.tsx             # Companion builder
│   ├── bonding.tsx             # Bonding dashboard
│   ├── memories.tsx            # Memory system
│   ├── scenes.tsx              # Scene gallery
│   ├── voice.tsx               # Voice studio
│   └── outfits.tsx             # Wardrobe
├── store/
│   ├── authStore.ts            # Authentication state
│   └── companionStore.ts       # Companion data
├── styles/
│   └── globals.css             # Global styles
└── [config files]
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_WS_URL=http://localhost:5001
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Create a production build:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Key Features

### Real-time Updates
- WebSocket integration for live updates
- Bond level changes push notifications
- Real-time emotional state updates

### State Management
- Zustand for global state
- Auth store for user authentication
- Companion store for character data

### Form Handling
- React Hook Form for validation
- Type-safe form data
- Client-side validation

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interactions

### Animations
- Framer Motion for smooth transitions
- Page transitions
- Component animations

## API Integration

The frontend communicates with the backend API via:
- REST endpoints for CRUD operations
- WebSocket for real-time updates
- JWT authentication

All API calls go through the configured Axios client in `lib/api.ts`.

## Authentication Flow

1. User logs in via `/login` or registers via `/register`
2. JWT token stored in localStorage
3. Token included in all API requests
4. Protected routes check authentication status
5. Auto-logout on token expiration

## Custom Hooks

### useSocket
Manages WebSocket connection for real-time updates.

### useBonding
Fetches and updates bonding data for a user-companion pair.

## Component Library

### Button
Multiple variants (primary, secondary, outline, ghost)
Multiple sizes (sm, md, lg)
Loading state support

### Card
Flexible padding options
Border and shadow styling

### Input
Label support
Error handling
Validation styling

### Badge
Multiple variants for different states
Status indicators

## Styling

Custom Tailwind configuration includes:
- Primary color palette
- Companion-specific colors (pink, purple, blue, emerald)
- Custom animations
- Extended spacing

## Performance

- Code splitting via Next.js
- Image optimization
- Lazy loading for components
- Efficient re-renders with Zustand

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Maintain consistent styling
4. Test responsive behavior
5. Write clear component names

## Deployment

The frontend can be deployed to:
- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

Environment variables must be configured for the production API URL.

## License

Proprietary - All rights reserved