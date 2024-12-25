export interface PlanetData {
  name: string;
  texture: string;
  size: number;
  orbitRadius: number;
  rotationSpeed: number;
  orbitSpeed: number;
  hasRings?: boolean;
  ringTexture?: string;
}

export interface CelestialObjectProps {
  texture: THREE.Texture;
  position: [number, number, number];
  size: number;
  rotationSpeed: number;
}

export interface SceneConfig {
  width: number;
  height: number;
  cameraPosition: [number, number, number];
  cameraFov: number;
  near: number;
  far: number;
}
