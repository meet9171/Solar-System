import { useRef, useEffect, memo } from 'react';
import * as THREE from 'three';
import { CelestialObjectProps } from '../../types/solar-system';

export const Planet = memo(function Planet({ texture, position, size, rotationSpeed }: CelestialObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const animate = () => {
      mesh.rotation.y += rotationSpeed;
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [rotationSpeed]);

  return (
    <mesh ref={meshRef} position={new THREE.Vector3(...position)}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshPhongMaterial map={texture} />
    </mesh>
  );
});
