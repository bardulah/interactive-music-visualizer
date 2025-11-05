import { ColorPalette } from '../types';

export const colorPalettes: ColorPalette[] = [
  {
    name: 'Neon Dreams',
    colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'],
    backgroundColor: '#0a0a0f',
  },
  {
    name: 'Ocean Deep',
    colors: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4'],
    backgroundColor: '#000814',
  },
  {
    name: 'Sunset Fire',
    colors: ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'],
    backgroundColor: '#1a0a0f',
  },
  {
    name: 'Purple Haze',
    colors: ['#7209b7', '#b5179e', '#f72585', '#4361ee', '#4cc9f0'],
    backgroundColor: '#10002b',
  },
  {
    name: 'Forest Mystique',
    colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7'],
    backgroundColor: '#081c15',
  },
  {
    name: 'Cyber Pink',
    colors: ['#ff0a54', '#ff477e', '#ff5c8a', '#ff7096', '#ff85a1', '#ff99ac'],
    backgroundColor: '#0d0221',
  },
  {
    name: 'Electric Blue',
    colors: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'],
    backgroundColor: '#000814',
  },
  {
    name: 'Golden Hour',
    colors: ['#ff9500', '#ff9f00', '#ffaa00', '#ffb700', '#ffc300', '#ffd000'],
    backgroundColor: '#1a0f0a',
  },
  {
    name: 'Nebula',
    colors: ['#5e17eb', '#8b4de8', '#b983e5', '#e7b9e2', '#ffc4e1'],
    backgroundColor: '#0a0514',
  },
  {
    name: 'Midnight Aurora',
    colors: ['#06ffa5', '#00d9ff', '#7b68ee', '#ff1493', '#ffd700'],
    backgroundColor: '#000000',
  },
];

export const getRandomPalette = (): ColorPalette => {
  return colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
};

// Analyze audio characteristics to suggest a palette
export const suggestPaletteFromAudio = (avgFrequency: number, bassLevel: number): ColorPalette => {
  // High energy music -> vibrant colors
  if (avgFrequency > 180 && bassLevel > 200) {
    return colorPalettes.find(p => p.name === 'Neon Dreams') || colorPalettes[0];
  }

  // Deep bass -> ocean or purple
  if (bassLevel > 180) {
    return colorPalettes.find(p => p.name === 'Ocean Deep') || colorPalettes[1];
  }

  // Calm music -> softer colors
  if (avgFrequency < 120) {
    return colorPalettes.find(p => p.name === 'Forest Mystique') || colorPalettes[4];
  }

  // Default to cyber pink
  return colorPalettes.find(p => p.name === 'Cyber Pink') || colorPalettes[5];
};
