import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { addNewPlanetAndSpaceToScene } from './planet-builder';
import { PlanetInfo } from './planet-types';

export interface SceneOptions {
  exportMode?: boolean;
  planetType?: string;
  size?: number;
}

export interface ExportFunctions {
  moveCameraDefault: Function,
  moveCameraCloseup: Function,
  generateNewPlanet: Function
}

const initializeCamera = (renderer: THREE.WebGLRenderer, exportMode: boolean, size?: number) => {
  const aspect = exportMode && size ? 1 : window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.enableDamping = true;
  controls.dampingFactor = .08
  controls.enabled = false

  return { camera, controls }
}

const initializeRenderer = (canvas: HTMLElement, exportMode: boolean, size?: number) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: exportMode,
    preserveDrawingBuffer: exportMode,
  })
  const w = exportMode && size ? size : window.innerWidth;
  const h = exportMode && size ? size : window.innerHeight;
  renderer.setSize(w, h);
  if (exportMode) {
    renderer.setClearColor(0x000000, 0);
  }
  if (!exportMode) {
    document.body.appendChild(renderer.domElement);
  }
  return renderer
}

let currentCleanupFn: () => void
let currentAnimateFn: () => void

export const initializeScene = (
  canvas: HTMLElement,
  setPlanetInfo: Function,
  callback: () => void = () => {},
  options: SceneOptions = {}
) => {
  const { exportMode = false, planetType, size } = options;

  const renderer = initializeRenderer(canvas, exportMode, size)
  const scene = new THREE.Scene()
  const { camera, controls } = initializeCamera(renderer, exportMode, size)

  if (exportMode) {
    camera.position.set(0, 0, 5);
  }

  const moveCameraCloseup = (cb = () => { }) => {
    controls.enabled = false
    gsap.to(camera.position, { x: 0, y: 0, z: 2.5, duration: 1.5, ease: 'power4.out' });
    gsap.to(controls.target, {
      x: 2.5, y: 0, z: 0, duration: 1.5, ease: 'power4.out', onComplete: () => {
        cb()
      }
    });
  }

  const moveCameraDefault = (cb = () => { }) => {
    controls.enabled = false
    gsap.to(camera.position, { x: 0, y: 0, z: 5, duration: 1.5, ease: 'power4.out' });
    gsap.to(controls.target, {
      x: 0, y: 0, z: 0, duration: 1.5, ease: 'power4.out', onComplete: () => {
        cb()
        controls.enabled = true
      }
    })
  }

  const doZoomShotWithCamera = (cb: () => void = () => { }) => {
    camera.position.set(-300, -300, 200);
    moveCameraDefault(cb)
  }

  const gotoNewPlanet = (cb: () => void) => {
    currentCleanupFn ? currentCleanupFn() : null
    const { planetInfo, planetAnimationFn, cleanupSceneFn } = addNewPlanetAndSpaceToScene(scene)
    currentCleanupFn = cleanupSceneFn
    currentAnimateFn = planetAnimationFn
    setPlanetInfo(planetInfo)
    doZoomShotWithCamera(cb)
  }

  const animate = () => {
    if (currentAnimateFn) {
      currentAnimateFn()
    }
    controls.update()
    window.requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  if (exportMode) {
    const { planetInfo, cleanupSceneFn, planetAnimationFn } = addNewPlanetAndSpaceToScene(
      scene,
      { type: planetType, exportMode: true }
    );
    currentCleanupFn = cleanupSceneFn;
    currentAnimateFn = planetAnimationFn;
    setPlanetInfo(planetInfo);

    let frameCount = 0;
    const exportAnimate = () => {
      renderer.render(scene, camera);
      frameCount++;
      if (frameCount < 5) {
        window.requestAnimationFrame(exportAnimate);
      } else {
        (window as any).__exportReady = true;
      }
    };
    exportAnimate();
  } else {
    gotoNewPlanet(callback);
    animate();
  }

  return {
    moveCameraDefault,
    moveCameraCloseup,
    generateNewPlanet: gotoNewPlanet
  }
}
