'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { useLoader } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader'
import GUI from "lil-gui";

export default function SolarSystem() {
 
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Load all textures at component level
  const textures = {
    sun: useLoader(TextureLoader, '/2k_sun.jpg'),
    mercury: useLoader(TextureLoader, '/2k_mercury.jpg'),
    venus: useLoader(TextureLoader, '/2k_venus_surface.jpg'),
    earth: useLoader(TextureLoader, '/2k_earth.jpg'),
    mars: useLoader(TextureLoader, '/2k_mars.jpg'),
    jupiter: useLoader(TextureLoader, '/2k_jupiter.jpg'),
    saturn: useLoader(TextureLoader, '/2k_saturn.jpg'),
    uranus: useLoader(TextureLoader, '/2k_uranus.jpg'),
    neptune: useLoader(TextureLoader, '/2k_neptune.jpg'),
    moon: useLoader(TextureLoader, '/2k_moon.jpg'),
    saturnRing: useLoader(TextureLoader, '/2k_saturn_ring_alpha.png'),
    // stars: useLoader(EXRLoader, '/starmap_2020_16k.exr')
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 50
    camera.position.y = 30

    // Renderer setup with shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,

    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    containerRef.current?.appendChild(renderer.domElement)

    // Post processing
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 500
    controls.minDistance = 10
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05)
    scene.add(ambientLight)

    // Add spherical sunlight (point light)
    const sunlight = new THREE.PointLight(0xffffff, 5, 100000, 0.6);
    sunlight.position.set(0, 0, 0);
    scene.add(sunlight);
    sunlight.castShadow = true
    sunlight.shadow.bias = -0.0001;
    sunlight.shadow.normalBias = 0.0001;

    // Softer bloom effect for natural glow
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.0,    // Moderate bloom strength
      1.0,    // Larger radius for very soft edges
      0.1     // Lower threshold for more natural glow
    )
    composer.addPass(bloomPass)

    // Stars background
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 50000
    const starsPositions = new Float32Array(starsCount * 3)

    for (let i = 0; i < starsCount * 3; i += 3) {
      starsPositions[i] = (Math.random() - 0.5) * 1000
      starsPositions[i + 1] = (Math.random() - 0.5) * 1000
      starsPositions[i + 2] = (Math.random() - 0.5) * 1000
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3))
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    // scene.add(stars)

    // Add skybox
    const skyboxGeometry = new THREE.SphereGeometry(500, 60, 40)
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      // map: textures.stars,
      side: THREE.BackSide,
      color: 0x000000
      // color:new THREE.Color(0xffffff).multiplyScalar(0.5)

    })
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
    scene.add(skybox)

    // Asteroid Belt
    const createAsteroidBelt = () => {
      const asteroidBelt = new THREE.Group()
      const asteroidCount = 10000
      const asteroidGeometry = new THREE.IcosahedronGeometry(0.3, 0)
      const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8
      })

      for (let i = 0; i < asteroidCount; i++) {
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
        const angle = (Math.random() * Math.PI * 2)
        const radius = 100 + Math.random() * 17
        asteroid.position.x = Math.cos(angle) * radius
        asteroid.position.z = Math.sin(angle) * radius
        asteroid.position.y = (Math.random() - 0.5) * 2
        asteroid.rotation.x = Math.random() * Math.PI
        asteroid.rotation.y = Math.random() * Math.PI
        asteroid.rotation.z = Math.random() * Math.PI
        asteroid.scale.setScalar(Math.random() * 0.5 + 0.5)
        asteroidBelt.add(asteroid)
      }

      return asteroidBelt
    }

    // Orbital Rings
    const createOrbitalRing = (radius: number, color: number) => {
      const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 100)
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      })
      const ring = new THREE.Mesh(geometry, material)
      ring.rotation.x = Math.PI / 2
      return ring
    }


    // Saturn's Rings
    // const createSaturnRings = () => {
    //   const geometry = new THREE.RingGeometry(13.5, 20, 64)
    //   const material = new THREE.MeshPhongMaterial({
    //     color: 0xffff00,
    //     side: THREE.DoubleSide,
    //     opacity: 1,
    //     emissive: new THREE.Color(0xffffff).multiplyScalar(0.9),
    //     emissiveIntensity: 0.1,

    //     emissiveMap: textures.saturnRing,
    //     map: textures.saturnRing
    //   })
    //   const rings = new THREE.Mesh(geometry, material)
    //   rings.rotation.x = Math.PI / 3
    //   return rings
    // }
    const createSaturnAsteroidRing = () => {
      const asteroidRing = new THREE.Group();
      const asteroidCount = 5000; // Adjust this for performance
      const asteroidGeometry = new THREE.IcosahedronGeometry(0.2, 0); // Smaller asteroid size
      const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
      });
    
      for (let i = 0; i < asteroidCount; i++) {
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        const angle = Math.random() * Math.PI * 2;
    
        // Set the radius for the asteroid ring (similar to Saturn's original ring size)
        const radius = 13.5 + Math.random() * 6.5; // Inner radius: 13.5, outer radius: 20
    
        asteroid.position.x = Math.cos(angle) * radius;
        asteroid.position.z = Math.sin(angle) * radius;
    
        // Slight thickness to make it more 3D
        asteroid.position.y = (Math.random() - 0.5) * 0.5;

        asteroid.rotation.x = Math.random() * Math.PI;
        asteroid.rotation.y = Math.random() * Math.PI;
        asteroid.rotation.z = Math.random() * Math.PI;
    
        asteroid.scale.setScalar(Math.random() * 0.3 + 0.3); // Randomized asteroid sizes
    
        asteroidRing.add(asteroid);
      }
    
      // Rotate the entire ring to match Saturn's tilt
      asteroidRing.rotation.x = Math.PI / 6;
    
      return asteroidRing;
    };
    

    // Create Moon
    const createMoon = (planetRadius: number) => {
      const moonGeometry = new THREE.SphereGeometry(planetRadius * 0.27, 32, 32)
      const moonMaterial = new THREE.MeshPhongMaterial({
        map: textures.moon,
        shininess: 25
      })
      const moon = new THREE.Mesh(moonGeometry, moonMaterial)
      return moon
    }

    // Planets data with textures and their corresponding loaded textures
    // const planets = [
    //   {
    //     name: 'Sun',
    //     radius: 5,
    //     distance: 0,
    //     texture: textures.sun,
    //     rotationSpeed: 0.001,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Mercury',
    //     radius: 1.745,
    //     distance: 15,
    //     texture: textures.mercury,
    //     rotationSpeed: 0.004,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Venus',
    //     radius: 0.433,
    //     distance: 22,
    //     texture: textures.venus,
    //     rotationSpeed: 0.003,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Earth',
    //     radius: 0.456,
    //     distance: 30,
    //     texture: textures.earth,
    //     rotationSpeed: 0.010,
    //     hasMoon: true,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Mars',
    //     radius: 0.243,
    //     distance: 35,
    //     texture: textures.mars,
    //     rotationSpeed: 0.0018,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Jupiter',
    //     radius: 5,
    //     distance: 48,
    //     texture: textures.jupiter,
    //     rotationSpeed: 0.001,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Saturn',
    //     radius: 4.163,
    //     distance: 60,
    //     texture: textures.saturn,
    //     rotationSpeed: 0.0008,
    //     hasMoon: false,
    //     hasRings: true
    //   },
    //   {
    //     name: 'Uranus',
    //     radius: 1.816,
    //     distance: 70,
    //     texture: textures.uranus,
    //     rotationSpeed: 0.0006,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Neptune',
    //     radius: 1.761,
    //     distance: 85,
    //     texture: textures.neptune,
    //     rotationSpeed: 0.0004,
    //     hasMoon: false,
    //     hasRings: false
    //   }
    // ]
    // const planets = [
    //   {
    //     name: 'Sun',
    //     radius: 20, // Sun is still the largest
    //     distance: 0,
    //     texture: textures.sun,
    //     rotationSpeed: 0,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Mercury',
    //     radius: 0.070,
    //     distance: 38.7,
    //     texture: textures.mercury,
    //     rotationSpeed: 1.4,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Venus',
    //     radius: 0.174,
    //     distance: 72.3,
    //     texture: textures.venus,
    //     rotationSpeed: 0.4,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Earth',
    //     radius: 0.183,
    //     distance: 100,
    //     texture: textures.earth,
    //     rotationSpeed: 0.060,
    //     hasMoon: true,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Mars',
    //     radius: 0.097,
    //     distance: 152.4,
    //     texture: textures.mars,
    //     rotationSpeed: 0.0018,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Jupiter',
    //     radius: 2.009,
    //     distance: 520.1,
    //     texture: textures.jupiter,
    //     rotationSpeed: 0.001,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Saturn',
    //     radius: 1.673,
    //     distance: 955.4,
    //     texture: textures.saturn,
    //     rotationSpeed: 0.0008,
    //     hasMoon: false,
    //     hasRings: true
    //   },
    //   {
    //     name: 'Uranus',
    //     radius: 0.729,
    //     distance: 1918.3,
    //     texture: textures.uranus,
    //     rotationSpeed: 0.0006,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Neptune',
    //     radius: 0.707,
    //     distance: 3006.1,
    //     texture: textures.neptune,
    //     rotationSpeed: 0.0004,
    //     hasMoon: false,
    //     hasRings: false
    //   }
    // ];

    // const planets = [
    //   {
    //     name: 'Sun',
    //     radius: 12, // Largest as reference
    //     distance: 0, // At the center
    //     texture: textures.sun,
    //     rotationSpeed: 0.05,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Mercury',
    //     radius: 1, // Minimum visible size
    //     distance: 20,
    //     texture: textures.mercury,
    //     rotationSpeed: 0.2,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Venus',
    //     radius: 2.5, // Slightly larger than Mercury
    //     distance: 40,
    //     texture: textures.venus,
    //     rotationSpeed: 0.12,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Earth',
    //     radius: 3, // Slightly larger than Venus
    //     distance: 60,
    //     texture: textures.earth,
    //     rotationSpeed: 0.5,
    //     hasMoon: true,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Mars',
    //     radius: 3.5, // Smaller than Earth
    //     distance: 90,
    //     texture: textures.mars,
    //     rotationSpeed: 0.15,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Jupiter',
    //     radius: 10, // Largest after the Sun
    //     distance: 140,
    //     texture: textures.jupiter,
    //     rotationSpeed: 0.8,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Saturn',
    //     radius: 8, // Slightly smaller than Jupiter
    //     distance: 200,
    //     texture: textures.saturn,
    //     rotationSpeed: 0,
    //     hasMoon: false,
    //     hasRings: true
    //   },
    //   {
    //     name: 'Uranus',
    //     radius: 4, // Smaller than Saturn
    //     distance: 260,
    //     texture: textures.uranus,
    //     rotationSpeed: 0.4,
    //     hasMoon: false,
    //     hasRings: false
    //   },
    //   {
    //     name: 'Neptune',
    //     radius: 3.8, // Slightly smaller than Uranus
    //     distance: 300,
    //     texture: textures.neptune,
    //     rotationSpeed: 0.35,
    //     hasMoon: false,
    //     hasRings: false
    //   }
    // ];

    const planets = [
      {
        name: 'Sun',
        radius: 12, // Largest as reference
        distance: 0, // At the center
        texture: textures.sun,
        rotationSpeed: 0.02, // Very slow (scaled)
        hasMoon: false,
        hasRings: false
      },
      {
        name: 'Mercury',
        radius: 1, // Minimum visible size
        distance: 20,
        texture: textures.mercury,
        rotationSpeed: 0.05, // Very slow due to its real rotation period (~58.6 Earth days)
        hasMoon: false,
        hasRings: false
      },
      {
        name: 'Venus',
        radius: 2.5, // Slightly larger than Mercury
        distance: 40,
        texture: textures.venus,
        rotationSpeed: 0.01, // Extremely slow due to its real rotation period (~243 Earth days)
        hasMoon: false,
        hasRings: false
      },
      {
        name: 'Earth',
        radius: 3, // Slightly larger than Venus
        distance: 60,
        texture: textures.earth,
        rotationSpeed: 0.1, // Normal rotation (~24 hours)
        hasMoon: true,
        hasRings: false
      },
      {
        name: 'Mars',
        radius: 3.5, // Smaller than Earth
        distance: 90,
        texture: textures.mars,
        rotationSpeed: 0.097, // Slightly slower than Earth (~24.6 hours)
        hasMoon: false,
        hasRings: false
      },
      {
        name: 'Jupiter',
        radius: 10, // Largest after the Sun
        distance: 140,
        texture: textures.jupiter,
        rotationSpeed: 0.25, // Very fast (~9.9 hours)
        hasMoon: false,
        hasRings: false
      },
      {
        name: 'Saturn',
        radius: 8, // Slightly smaller than Jupiter
        distance: 200,
        texture: textures.saturn,
        rotationSpeed: 0.23, // Fast (~10.7 hours)
        hasMoon: false,
        hasRings: true
      },
      {
        name: 'Uranus',
        radius: 4, // Smaller than Saturn
        distance: 260,
        texture: textures.uranus,
        rotationSpeed: 0.141, // Moderate speed (~17.2 hours)
        hasMoon: false,
        hasRings: false
      },
      {
        name: 'Neptune',
        radius: 3.8, // Slightly smaller than Uranus
        distance: 300,
        texture: textures.neptune,
        rotationSpeed: 0.147, // Moderate speed (~16.1 hours)
        hasMoon: false,
        hasRings: false
      }
    ];
    
    
    // Create and add asteroid belt
    const asteroidBelt = createAsteroidBelt()
    scene.add(asteroidBelt)

    // Initialize planets
    const initializePlanets = async () => {
      const planetObjects = await Promise.all(
        planets.map(async (planet) => {
          const geometry = new THREE.SphereGeometry(planet.radius, 64, 64)
          const material = new THREE.MeshPhongMaterial({
            map: planet.texture,
            displacementMap: planet.texture,
            displacementScale: 0.05,
            bumpMap: planet.texture,
            bumpScale: 0.02,
            roughness: planet.name === 'Sun' ? 0.05 : 0.9,
            metalness: 0.5,
            shininess: planet.name === 'Sun' ? 0 : 30,
            emissiveMap: planet.texture,
            emissive: planet.name === 'Sun' ? new THREE.Color(0xeae839).multiplyScalar(0.9) : new THREE.Color(0x000000),
            emissiveIntensity: planet.name === 'Sun' ? 5 : 0.2,
            // Add specular highlights
          })

          const mesh = new THREE.Mesh(geometry, material)

          if (planet.name === 'Sun') {
            mesh.castShadow = false
            mesh.receiveShadow = false
          } else {
            mesh.castShadow = true
            mesh.receiveShadow = true
          }

          const planetGroup = new THREE.Group()
          planetGroup.add(mesh)

          const createInclinedOrbitalRing = (radius: number, inclination: number) => {
            const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 100);
            const material = new THREE.MeshBasicMaterial({
              color: 0x666666,
              transparent: true,
              opacity: 0.3,
              side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2; // Rotate to horizontal first
            // ring.rotation.y = THREE.MathUtils.degToRad(inclination); // Apply inclination
            return ring;
          };

          const createMercuryOrbitalRing = (radius: number, inclination: number) => {
            const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 100);
            const material = new THREE.MeshBasicMaterial({
              color: 0x666666,
              transparent: true,
              opacity: 0.3,
              side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2; // Rotate to horizontal first
            ring.rotation.y = THREE.MathUtils.degToRad(inclination); // Apply inclination
            return ring;
          };
          const createVenusOrbitalRing = (radius: number, inclination: number) => {
            const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 100);
            const material = new THREE.MeshBasicMaterial({
              color: 0x666666,
              transparent: true,
              opacity: 0.3,
              side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2; // Rotate to horizontal first
            ring.rotation.y = THREE.MathUtils.degToRad(inclination); // Apply inclination
            return ring;
          };

          if (planet.name === 'Earth') {

          }

          // Add orbital ring
          if (planet.distance > 0) {
            if (planet.name === 'Mercury') {
              const ring = createOrbitalRing(planet.distance,0x8105b3)
              scene.add(ring)
            } else if (planet.name === 'Venus') {
              const ring = createOrbitalRing(planet.distance,0xad8e03)
              scene.add(ring)
            } else if (planet.name === 'Earth') {
              const ring = createOrbitalRing(planet.distance,0x0371ad)
              scene.add(ring)
            } else if (planet.name === 'Mars') {
              const ring = createOrbitalRing(planet.distance,0xad6303)
              scene.add(ring)
            } else if (planet.name === 'Jupiter') {
              const ring = createOrbitalRing(planet.distance,0xde9a07)
              scene.add(ring)
            } else if (planet.name === 'Saturn') {
              const ring = createOrbitalRing(planet.distance,0xb8af06)
              scene.add(ring)
            } else if (planet.name === 'Uranus') {
              const ring = createOrbitalRing(planet.distance,0x0680b8)
              scene.add(ring)
            } else if (planet.name === 'Neptune') {
              const ring = createOrbitalRing(planet.distance,0x064ab8)
              scene.add(ring)
            } else {
              const ring = createOrbitalRing(planet.distance,0x8105b3)
              scene.add(ring)
            }
          }

          // Add moon if planet has one
          if (planet.hasMoon) {
            const moon = createMoon(planet.radius)
            moon.position.x = planet.radius * 2
            planetGroup.add(moon)
          }

          // Add Saturn's rings
          if (planet.hasRings) {
            const rings = createSaturnAsteroidRing();
            planetGroup.add(rings)
          }

          planetGroup.position.x = planet.distance;
          // planetGroup.position.y = 10;
          // planetGroup.position.z = 1000;
          scene.add(planetGroup)

          return { group: planetGroup, ...planet }
        })
      )

      setLoadingProgress(100)
      setTimeout(() => setLoading(false), 500)
      return planetObjects
    }

    // Animation loop
    let frameId: number
    let planetObjects: Awaited<ReturnType<typeof initializePlanets>>

    // let inclinationAngle = 23.5; // Define the inclination angle as a variable
    const animate = (planetObjects: any[]) => {

      planetObjects.forEach((planetObj) => {

        const angle = Date.now() * 0.001 * planetObj.rotationSpeed
        const distance = planetObj.distance
        planetObj.group.position.x = Math.cos(angle) * distance
        planetObj.group.position.z = Math.sin(angle) * distance
        // planetObj.group.position.y = Math.sin(angle) * (Math.PI * 2.5)

        // Update planet material for day/night effect
        const planetMesh = planetObj.group.children[0]

        // Rotate planets
        planetMesh.rotation.y += planetObj.rotationSpeed * 2

        // Update moon rotation and lighting
        if (planetObj.hasMoon && planetObj.group.children.length > 1) {
          const moon = planetObj.group.children[1]
          const moonAngle = Date.now() * 0.002
          moon.position.x = Math.cos(moonAngle) * (planetObj.radius * 2)
          moon.position.z = Math.sin(moonAngle) * (planetObj.radius * 2)

          // Calculate moon lighting
          const moonToSun = new THREE.Vector3()
            .subVectors(new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(
                moon.position.x + planetObj.group.position.x,
                moon.position.y + planetObj.group.position.y,
                moon.position.z + planetObj.group.position.z
              ))
            .normalize()

          if (moon.material) {
            moon.material.emissive = new THREE.Color(0x333333)
            moon.material.emissiveIntensity = Math.max(0.1, 0.4 * (1 + moonToSun.dot(new THREE.Vector3(1, 0, 0))))
          }

          moon.rotation.y += 0.02
        }
      })

      controls.update()
      asteroidBelt.rotation.y += 0.0001
      // billboardUpdate()
      composer.render()

      frameId = requestAnimationFrame(() => animate(planetObjects))
    }

    // Initialize and start animation
    initializePlanets().then(objects => {
      planetObjects = objects
      animate(planetObjects)
    })

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameId)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="relative w-full h-screen bg-black">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">
          <p className="text-xl italic mb-4">Fetching stellar data...</p>
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )

}
