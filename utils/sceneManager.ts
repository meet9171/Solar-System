import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SceneConfig } from '../types/solar-system';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private controls: OrbitControls;

  constructor(container: HTMLElement, config: SceneConfig) {
    // Scene setup
    this.scene = new THREE.Scene();
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      config.cameraFov,
      config.width / config.height,
      config.near,
      config.far
    );
    this.camera.position.set(...config.cameraPosition);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(config.width, config.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Controls setup
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Post-processing setup
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(config.width, config.height),
      1.5,
      0.4,
      0.85
    );
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  public addObject(object: THREE.Object3D) {
    this.scene.add(object);
  }

  public animate() {
    this.controls.update();
    this.composer.render();
    requestAnimationFrame(this.animate.bind(this));
  }

  public dispose() {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.renderer.dispose();
    this.scene.clear();
  }
}
