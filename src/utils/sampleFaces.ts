export interface SampleFace {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  expectedShape: string;
  isLogo?: boolean;
}

export const SAMPLE_FACES: SampleFace[] = [
  {
    id: 'sample-1',
    name: 'Square / Chiselled',
    description: 'Strong angular mandible, compact midface, high bilateral symmetry',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    expectedShape: 'Square'
  },
  {
    id: 'sample-2',
    name: 'Harmonic Oval',
    description: 'Balanced vertical thirds (33-33-33), smooth zygomatic curve',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    expectedShape: 'Oval'
  },
  {
    id: 'sample-3',
    name: 'Sharp Diamond',
    description: 'Prominent high cheekbones with defined tapered lower third',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    expectedShape: 'Diamond'
  },
  {
    id: 'sample-4',
    name: 'Classic Proportions',
    description: 'Forward-facing neutral portrait ideal for ratio calibration',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    expectedShape: 'Oval'
  },
  {
    id: 'sample-logo',
    name: 'App Logo (Non-Face Test)',
    description: 'Vector logo to test and verify rejection of non-face graphics',
    imageUrl: '/logo.svg',
    expectedShape: 'None',
    isLogo: true
  }
];
