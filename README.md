# LST Cue Controller

A professional lighting and show control interface built with Vue 3, TypeScript, and Tailwind CSS. This application provides real-time control over lighting cues, automated checklists, and keyboard shortcuts for efficient show management.

## Features

### Cue Management
- **Organized Cue Lists**: Cues are categorized into separate lists (INTRO, WEIGHT, OFFERING, etc.)
- **Auto-Progression**: Automatically advances to the next cue list when reaching the end of the current list
- **Preview Mode**: Shows upcoming cues from the next list in a greyed-out state
- **Real-time Status**: Visual indicators for active cues and connection status

### Function Toggles
- **Categorized Controls**: Quick access to different types of cues (Active, All, Custom)
- **Toggle Interface**: Easy-to-use buttons for toggling individual cues
- **Active Cues Panel**: Shows all currently running cues with stop controls

### Checklists
- **Pre-show Procedures**: Guided checklists for venue opening and show preparation
- **Automated Steps**: Integration with system commands for automated tasks
- **Progress Tracking**: Visual progress indicators and step completion status
- **Required Steps**: Clearly marked required steps that cannot be skipped

### Keyboard Shortcuts
- **Quick Controls**: Efficient keyboard shortcuts for common actions
- Space/Tab: Go to next cue
- PageUp/Down: Navigate through cues
- B: Stop all active cues
- F11: Trigger specific cues

## Technical Details

### WebSocket Communication
- Real-time connection to lighting control system
- Automatic reconnection on connection loss
- Status indicators for connection health

### Responsive Design
- Mobile-friendly interface
- Flexible grid layout
- Optimized for different screen sizes

### Type Safety
- Built with TypeScript for enhanced reliability
- Strong typing for all components and data structures
- Comprehensive type definitions for external data

## Development

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure
- `/src/components`: Vue components
- `/src/types`: TypeScript type definitions
- `/src/data`: Static data and configurations

## License
All rights reserved. This is proprietary software.