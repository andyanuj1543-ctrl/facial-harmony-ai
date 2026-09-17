import { Gender, ViewMode } from '../types';

export interface SampleFace {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  gender: Gender;
  viewMode: ViewMode;
  isLogo?: boolean;
}

export const SAMPLE_FACES: SampleFace[] = [
  {
    id: 'sample-male-1',
    name: 'Marcus • Square Mandible',
    description: 'Structured gonial angle, balanced thirds, prominent masculine chin',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    gender: 'male',
    viewMode: 'front'
  },
  {
    id: 'sample-male-2',
    name: 'Alexander • Classic Oval',
    description: 'Harmonic vertical thirds, balanced cheekbone width, high symmetry',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    gender: 'male',
    viewMode: 'front'
  },
  {
    id: 'sample-male-3',
    name: 'Viktor • Diamond Chiseled',
    description: 'High zygomatic prominence, defined jawline taper, compact lower third',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    gender: 'male',
    viewMode: 'front'
  },
  {
    id: 'sample-male-4',
    name: 'Julian • Athletic Oblong',
    description: 'Extended masculine facial height, balanced midface proportion',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    gender: 'male',
    viewMode: 'front'
  },
  {
    id: 'sample-profile-male',
    name: 'David • Lateral E-Line Profile',
    description: 'Optimal 92° nasolabial angle, balanced Ricketts chin projection',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    gender: 'male',
    viewMode: 'profile'
  },
  {
    id: 'sample-logo',
    name: 'App Logo (Non-Face Test)',
    description: 'Vector logo to test and verify rejection of non-face graphics',
    imageUrl: '/logo.svg',
    gender: 'male',
    viewMode: 'front',
    isLogo: true
  }
];
