import type { Checklist } from '@/types';

export const checklists: Checklist[] = [
  {
    id: 'venue-open',
    name: 'Venue Opening Procedure',
    steps: [
      {
        name: 'Start QLC+',
        description: 'Launch lighting control software',
        type: 'automated',
        action: 'startQlc',
        required: true
      },
      {
        name: 'Start LST Controller',
        description: 'Launch LST controller',
        type: 'automated',
        action: 'startLstController',
        required: true
      },
      {
        name: 'Turn off shop lights',
        description: 'Switch off all work lights in shop area',
        type: 'manual',
      },
      {
        name: 'Move props to stage',
        description: 'Place all marked props in their starting positions',
        type: 'manual',
      }
    ]
  }
];