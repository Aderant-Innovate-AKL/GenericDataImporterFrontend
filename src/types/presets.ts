export interface KeyDefinition {
  keyName: string;
  keyDescription: string;
}

export interface Preset {
  id: string;
  name: string;
  businessContext: string;
  keyDefinitions: KeyDefinition[];
}

export interface PresetsData {
  presets: Preset[];
}
