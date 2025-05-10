export interface Cue {
  id: string;
  name: string;
  type: string;
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

export interface CueState {
  activeCues: string[];
  cueMapping: CueMapping;
  qlcFunctions: any[];
}

export type CueAction = 'start' | 'stop';

export interface WebSocketMessage {
  type: string;
  data?: CueState;
  cueId?: string;
  action?: CueAction;
  message?: string;
  result?: any;
}
