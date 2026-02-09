
import { FontConfig, PaperType, InkColor, NoteSettings } from './types';

export const HANDWRITING_FONTS: FontConfig[] = [
  { id: 'caveat', name: 'Standard Caveat', family: '"Caveat", cursive' },
  { id: 'indie', name: 'Indie Casual', family: '"Indie Flower", cursive' },
  { id: 'patrick', name: 'Neat Patrick', family: '"Patrick Hand", cursive' },
  { id: 'shadows', name: 'Artistic Shadows', family: '"Shadows Into Light", cursive' },
  { id: 'gloria', name: 'Bold Hallelujah', family: '"Gloria Hallelujah", cursive' },
  { id: 'dancing', name: 'Elegant Dancing', family: '"Dancing Script", cursive' },
  { id: 'sacramento', name: 'Fancy Sacramento', family: '"Sacramento", cursive' },
  { id: 'homemade', name: 'Rustic Apple', family: '"Homemade Apple", cursive' },
  { id: 'reenie', name: 'Quick Note', family: '"Reenie Beanie", cursive' },
  { id: 'kalam', name: 'Modern Kalam', family: '"Kalam", cursive' },
  { id: 'zeyada', name: 'Flowing Zeyada', family: '"Zeyada", cursive' },
  { id: 'mrdafoe', name: 'Classic Dafoe', family: '"Mr Dafoe", cursive' },
  { id: 'grandhotel', name: 'Grand Hotel', family: '"Grand Hotel", cursive' },
];

export const INK_COLORS = {
  [InkColor.BLUE]: '#1d4ed8', 
  [InkColor.BLACK]: '#1e293b', 
  [InkColor.RED]: '#b91c1c', 
  [InkColor.GREEN]: '#15803d', 
  [InkColor.PENCIL]: '#4b5563', 
};

export const PAPER_STYLES = {
  [PaperType.PLAIN]: 'bg-[#ffffff]',
  [PaperType.RULED]: 'bg-[#ffffff] bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:100%_2.5rem]',
  [PaperType.GRID]: 'bg-[#ffffff] bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[length:2rem_2rem]',
  [PaperType.VINTAGE]: 'bg-[#fdf6e3] bg-[radial-gradient(#00000005_1px,transparent_0)] bg-[length:4px_4px]',
  [PaperType.YELLOW_LEGAL]: 'bg-[#fff9c4] bg-[linear-gradient(#fdd83544_1px,transparent_1px)] bg-[length:100%_2.5rem]',
  [PaperType.GRAPHITE]: 'bg-[#e2e8f0] bg-[radial-gradient(#0000000a_1px,transparent_0)] bg-[length:2px_2px]',
  [PaperType.RECYCLED]: 'bg-[#d2b48c33] bg-[url("https://www.transparenttextures.com/patterns/handmade-paper.png")]',
  [PaperType.BLUEPRINT]: 'bg-[#003366] bg-[linear-gradient(#ffffff11_1px,transparent_1px),linear-gradient(90deg,#ffffff11_1px,transparent_1px)] bg-[length:2rem_2rem]',
};

export const TEMPLATES: { name: string; icon: string; settings: Partial<NoteSettings> }[] = [
  {
    name: "Formal Letter",
    icon: "✉️",
    settings: { 
      fontId: 'patrick', 
      fontSize: 18, 
      inkColor: InkColor.BLACK,
      paperType: PaperType.PLAIN,
      lineSpacing: 2.0,
      margin: 50,
      textAlign: 'left'
    }
  },
  {
    name: "Casual Note",
    icon: "✍️",
    settings: { 
      fontId: 'caveat', 
      fontSize: 24, 
      inkColor: InkColor.BLUE,
      paperType: PaperType.RULED,
      lineSpacing: 1.6,
      tilt: 1.2
    }
  },
  {
    name: "Study Guide",
    icon: "📖",
    settings: { 
      fontId: 'kalam', 
      fontSize: 20, 
      inkColor: InkColor.PENCIL,
      paperType: PaperType.GRID,
      lineSpacing: 1.4,
      paddingX: 50
    }
  },
  {
    name: "Old Journal",
    icon: "📜",
    settings: { 
      fontId: 'homemade', 
      fontSize: 22, 
      inkColor: InkColor.BLACK,
      paperType: PaperType.VINTAGE,
      lineSpacing: 1.8,
      tilt: -0.5
    }
  },
  {
    name: "Architect",
    icon: "📐",
    settings: { 
      fontId: 'indie', 
      fontSize: 16, 
      inkColor: InkColor.BLUE, // Blueprint white handled by CSS logic
      paperType: PaperType.BLUEPRINT,
      lineSpacing: 1.5,
      letterSpacing: 1
    }
  }
];
