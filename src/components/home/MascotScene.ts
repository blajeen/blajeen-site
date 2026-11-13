import * as T from "three";
import { GLTFLoader, type GLTFParser } from "three/addons/loaders/GLTFLoader.js";

const MODEL = "/models/tripo_convert_76d53895-e49c-4125-b6fe-e16c1ccb5b93.glb";

export function createMascot(host: HTMLElement, ready: () => void, failed: () => void) {
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, 0.01, 100);
  scene.add(new T.HemisphereLight(0xffffff, 0x67735a, 2.4));
  const key = new T.DirectionalLight(0xffffff, 3);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new T.DirectionalLight(0xe6ff9a, 1.5);
  rim.position.set(-3, 2, -2);
  scene.add(rim);
  let disposed = false;
  let motion = false;
  let mixer: T.AnimationMixer | null = null;
  let model: T.Group | null = null;
  let frame = 0;
  let previous = 0;
  let radius = 1;
  const center = new T.Vector3();

  function resize() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const vertical = T.MathUtils.degToRad(camera.fov / 2);
    const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
    const distance = radius / Math.sin(Math.min(vertical, horizontal)) * 1.08;
    camera.position.copy(center).add(new T.Vector3(0, radius * 0.08, distance));
    camera.lookAt(center);
    camera.far = distance + radius * 4;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  function tick(now: number) {
    frame = 0;
    if (disposed || document.hidden || !motion || !mixer) return;
    mixer.update(previous ? Math.min((now - previous) / 1000, 0.05) : 0);
    previous = now;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    previous = 0;
    frame = 0;
    if (!disposed && motion && mixer && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function disposeModel(root: T.Object3D) {
    const textures = new Set<T.Texture>();
    const materials = new Set<T.Material>();
    root.traverse((node) => {
      if (!(node instanceof T.Mesh)) return;
      node.geometry.dispose();
      if (node instanceof T.SkinnedMesh) node.skeleton.dispose();
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        materials.add(material);
        for (const value of Object.values(material)) if (value instanceof T.Texture) textures.add(value);
      }
    });
    textures.forEach((texture) => texture.dispose());
    materials.forEach((material) => material.dispose());
  }

  const loader = new GLTFLoader();
  // A CSP permite imagens blob:, mas não fetch(blob:). Como no Carrelio,
  // usa <img> em vez do ImageBitmapLoader, preservando a política do site.
  loader.register((parser: GLTFParser) => {
    parser.textureLoader = new T.TextureLoader(parser.options.manager);
    return { name: "MascotCspTextures" };
  });
  loader.load(MODEL, (gltf) => {
    if (disposed) { disposeModel(gltf.scene); return; }
    model = gltf.scene;
    scene.add(model);
    mixer = new T.AnimationMixer(model);
    const clip = gltf.animations.find((animation) => /dance_02/i.test(animation.name))
      ?? gltf.animations.find((animation) => /dance/i.test(animation.name));
    if (!clip) { failed(); return; }
    mixer.clipAction(clip).play();
    // Enquadra a dança inteira, incluindo braços e pés, sem variar a câmera a cada quadro.
    const bounds = new T.Box3();
    for (let sample = 0; sample <= 24; sample++) {
      mixer.setTime(clip.duration * sample / 24);
      model.updateMatrixWorld(true);
      bounds.union(new T.Box3().setFromObject(model, true));
    }
    bounds.getCenter(center);
    radius = bounds.getSize(new T.Vector3()).length() / 2;
    mixer.setTime(0);
    resize();
    ready();
    sync();
  }, undefined, () => { if (!disposed) failed(); });

  const observer = new ResizeObserver(resize);
  observer.observe(host);
  document.addEventListener("visibilitychange", sync);
  function contextLost(event: Event) { event.preventDefault(); sync(); failed(); }
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  resize();

  return {
    setMotion(value: boolean) { motion = value; sync(); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      mixer?.stopAllAction();
      if (model) { mixer?.uncacheRoot(model); disposeModel(model); }
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
