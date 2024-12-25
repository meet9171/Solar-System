import { PlanetData } from '../types/solar-system';

export const PLANETS_DATA: PlanetData[] = [
  {
    name: 'Sun',
    texture: '/2k_sun.jpg',
    size: 15,
    orbitRadius: 0,
    rotationSpeed: 0.004,
    orbitSpeed: 0
  },
  {
    name: 'Mercury',
    texture: '/2k_mercury.jpg',
    size: 3.8,
    orbitRadius: 28,
    rotationSpeed: 0.004,
    orbitSpeed: 0.04
  },
  {
    name: 'Venus',
    texture: '/2k_venus_surface.jpg',
    size: 5.8,
    orbitRadius: 44,
    rotationSpeed: 0.002,
    orbitSpeed: 0.015
  },
  {
    name: 'Earth',
    texture: '/2k_earth.jpg',
    size: 6,
    orbitRadius: 62,
    rotationSpeed: 0.02,
    orbitSpeed: 0.01
  },
  {
    name: 'Mars',
    texture: '/2k_mars.jpg',
    size: 4,
    orbitRadius: 78,
    rotationSpeed: 0.018,
    orbitSpeed: 0.008
  },
  {
    name: 'Jupiter',
    texture: '/2k_jupiter.jpg',
    size: 12,
    orbitRadius: 100,
    rotationSpeed: 0.04,
    orbitSpeed: 0.002
  },
  {
    name: 'Saturn',
    texture: '/2k_saturn.jpg',
    size: 10,
    orbitRadius: 138,
    rotationSpeed: 0.038,
    orbitSpeed: 0.0009,
    hasRings: true,
    ringTexture: '/2k_saturn_ring_alpha.png'
  },
  {
    name: 'Uranus',
    texture: '/2k_uranus.jpg',
    size: 7,
    orbitRadius: 176,
    rotationSpeed: 0.03,
    orbitSpeed: 0.0004
  },
  {
    name: 'Neptune',
    texture: '/2k_neptune.jpg',
    size: 7,
    orbitRadius: 200,
    rotationSpeed: 0.032,
    orbitSpeed: 0.0001
  }
];
