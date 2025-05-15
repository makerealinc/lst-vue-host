export interface Cue {
  id: string;
  name: string;
  type: string;
}

export interface QlcCue {
  qlcId: number;
  id: string;
  name: string;
  fullName: string;
}

export interface CueMappingItem {
  qlcId: number;
  name: string;
  fullName: string;
  type: string;
}

export interface CueMapping {
  [key: string]: CueMappingItem;
}

export interface TabConfig {
  tabs: ToggleTab[];
}

export interface CueState {
  activeCues: string[];
  cueMapping: CueMapping;
  qlcFunctions: any[];
  tabs?: ToggleTab[];
}

export type CueAction = 'start' | 'stop';

export interface WebSocketMessage {
  type: string;
  data?: CueState | TabConfig;
  cueId?: string;
  action?: CueAction;
  message?: string;
  result?: any;
}

export interface ToggleTab {
  name: string;
  cues: string[];
}

export interface KeyboardMacro {
  key: string;
  description: string;
  handler: () => void;
}

export interface ChecklistStep {
  name: string;
  description: string;
  type: 'manual' | 'automated';
  action?: string;
  required?: boolean;
  skipped?: boolean;
}

export interface Checklist {
  id: string;
  name: string;
  steps: ChecklistStep[];
}