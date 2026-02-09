
export enum PaperType {
  PLAIN = 'PLAIN',
  RULED = 'RULED',
  GRID = 'GRID',
  VINTAGE = 'VINTAGE',
  YELLOW_LEGAL = 'YELLOW_LEGAL',
  GRAPHITE = 'GRAPHITE',
  RECYCLED = 'RECYCLED',
  BLUEPRINT = 'BLUEPRINT'
}

export enum InkColor {
  BLUE = 'BLUE',
  BLACK = 'BLACK',
  RED = 'RED',
  GREEN = 'GREEN',
  PENCIL = 'PENCIL'
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface FontConfig {
  id: string;
  name: string;
  family: string;
}

export interface NoteSettings {
  text: string;
  fontId: string;
  fontSize: number;
  inkColor: InkColor;
  paperType: PaperType;
  lineSpacing: number;
  letterSpacing: number;
  margin: number;
  tilt: number;
  textAlign: TextAlign;
  paddingX: number;
  paddingY: number;
  customFontUrl?: string;
  useCustomFont?: boolean;
}

export interface NotePage {
  id: string;
  text: string;
  settings: NoteSettings;
}
