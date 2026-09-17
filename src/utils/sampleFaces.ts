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
    name: 'Male • Square Jaw',
    description: 'Structured mandible, balanced thirds, high symmetry',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    gender: 'male',
    viewMode: 'front'
  },
  {
    id: 'sample-male-2',
    name: 'Male • Harmonic Oval',
    description: 'Proportional vertical thirds, natural cheekbone width',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    gender: 'male',
    viewMode: 'front'
  },
  {
    id: 'sample-female-1',
    name: 'Female • Soft Oval',
    description: 'Delicate tapered lower third, open palpebral fissure, arched brows',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    gender: 'female',
    viewMode: 'front'
  },
  {
    id: 'sample-female-2',
    name: 'Female • Heart / V-Line',
    description: 'High zygomatic arches, tapered chin projection, youthful midface',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    gender: 'female',
    viewMode: 'front'
  },
  {
    id: 'sample-profile-male',
    name: 'Profile • Side View',
    description: 'True lateral view for Ricketts E-line and Nasolabial angle measurement',
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
