import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type Station = "lab" | "produto" | "morvelio";

/** Original procedural scene: no remote models, textures or third-party game assets. */
export function createLab(
  host: HTMLElement,
  choose: (station: Station) => void,
) {
  const scene = new T.Scene();
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.VSMShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  const environmentRoom = new RoomEnvironment();
  const pmrem = new T.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(environmentRoom, 0.06);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.8;
  environmentRoom.dispose();
  pmrem.dispose();
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const camera = new T.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(9, 8, 12);
  const target = new T.Vector3(0, 1, 0),
    desired = new T.Vector3(9, 8, 12),
    aim = new T.Vector3(0, 1, 0);
  scene.add(new T.HemisphereLight(0xdce8e1, 0x151b17, 0.65));
  const key = new T.DirectionalLight(0xffefd5, 3.2);
  key.position.set(-3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -7;
  key.shadow.normalBias = 0.035;
  key.shadow.bias = -0.0002;
  key.shadow.radius = 5;
  key.shadow.blurSamples = 8;
  scene.add(key);
  const rim = new T.DirectionalLight(0xb4d2ea, 1.8);
  rim.position.set(-5, 4, -4);
  scene.add(rim);
  const mats: T.Material[] = [];
  const geometries: T.BufferGeometry[] = [];
  const textures: T.Texture[] = [];
  const material = (
    color: number,
    metalness = 0.1,
    roughness = 0.6,
    emissive = 0,
  ) => {
    const m = new T.MeshPhysicalMaterial({
      clearcoat: metalness > 0.3 ? 0.18 : 0,
      clearcoatRoughness: 0.3,
      color,
      metalness,
      roughness,
      emissive,
      emissiveIntensity: 0.35,
    });
    mats.push(m);
    return m;
  };
  const steel = material(0x344b3d, 0.45, 0.4),
    dark = material(0x101c20, 0.5, 0.4),
    trim = material(0xc4ae7f, 0.8, 0.26),
    green = material(0xb3e84d, 0.25, 0.35, 0x557519),
    stone = material(0xa8997b),
    roof = material(0x274750),
    blue = material(0x91d7de, 0.2, 0.3, 0x1b5559),
    purple = material(0xa465dc, 0.1, 0.3, 0x53239d);
  function mesh(
    g: T.BufferGeometry,
    m: T.Material,
    parent: T.Object3D,
    x: number,
    y: number,
    z: number,
  ) {
    geometries.push(g);
    const o = new T.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }
  const box = (
    w: number,
    h: number,
    d: number,
    m: T.Material,
    p: T.Object3D,
    x = 0,
    y = 0,
    z = 0,
  ) => mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * 0.16), m, p, x, y, z);
  const sphere = (
    r: number,
    m: T.Material,
    p: T.Object3D,
    x = 0,
    y = 0,
    z = 0,
  ) => mesh(new T.SphereGeometry(r, 32, 20), m, p, x, y, z);
  const cylinder = (
    r: number,
    r2: number,
    h: number,
    m: T.Material,
    p: T.Object3D,
    x = 0,
    y = 0,
    z = 0,
    n = 32,
  ) => mesh(new T.CylinderGeometry(r, r2, h, n), m, p, x, y, z);
  const graphite = material(0x171d1b, 0.65, 0.32);
  const silver = material(0x9ca99e, 0.85, 0.25);
  const rubber = material(0x111815, 0.03, 0.9);
  const warmLight = material(0xe9c885, 0.05, 0.3, 0xe5b457);
  const root = new T.Group();
  scene.add(root);
  // A low architectural stage lets the exhibits dominate the silhouette.
  box(7.8, 0.18, 5.1, graphite, root, 0, -0.35, 0);
  box(7.7, 0.035, 5.0, silver, root, 0, -0.245, 0);
  box(7.65, 0.11, 4.95, rubber, root, 0, -0.18, 0);
  for (const x of [-3.5, 3.5]) {
    for (const z of [-2.1, 2.1]) cylinder(0.12, 0.14, 0.2, graphite, root, x, -0.5, z);
    box(0.018, 0.009, 3.4, silver, root, x, -0.119, 0);
  }
  // Subtle illumination embedded in the front edge, not a neon perimeter.
  box(0.55, 0.016, 0.015, green, root, -2.8, -0.3, 2.56);
  for (let i = 0; i < 3; i++) box(0.055, 0.016, 0.015, silver, root, 2.5 + i * 0.12, -0.3, 2.56);
  const groups: Record<Station, T.Group> = {
    lab: new T.Group(),
    produto: new T.Group(),
    morvelio: new T.Group(),
  };
  groups.lab.position.set(-0.15, 0, 1.1);
  groups.produto.position.set(-2.15, 0, -0.8);
  groups.morvelio.position.set(2.1, 0, -0.65);
  for (const [id, g] of Object.entries(groups)) {
    root.add(g);
    g.userData["station"] = id;
    cylinder(1.25, 1.28, 0.32, graphite, g, 0, 0.1, 0, 64);
    cylinder(1.26, 1.26, 0.015, silver, g, 0, 0.275, 0);
    cylinder(1.22, 1.22, 0.03, rubber, g, 0, 0.29, 0);
  }
  // A mechanical dinosaur, built with articulated volumes, lenses and brass joints.
  const dino = groups.lab;
  dino.rotation.y = 0.22;
  const body = sphere(0.62, steel, dino, 0, 1.05, 0);
  body.scale.set(0.8, 1.1, 1.3);
  for (const x of [-0.38, 0.38]) {
    sphere(0.22, trim, dino, x, 0.54, 0.1);
    box(0.28, 0.45, 0.3, steel, dino, x, 0.45, 0.12);
    box(0.38, 0.15, 0.6, dark, dino, x, 0.29, 0.3);
  }
  const neck = cylinder(0.22, 0.3, 0.65, steel, dino, 0, 1.65, 0.18);
  neck.rotation.x = 0.4;
  // Layered chest plate and paired optical lenses establish the mascot silhouette.
  const chest = sphere(0.46, dark, dino, 0, 1.07, 0.38);
  chest.scale.set(0.9, 0.95, 0.4);
  for (const x of [-0.15, 0, 0.15]) box(0.045, 0.3, 0.045, trim, dino, x, 1.08, 0.57);
  const head = new T.Group();
  head.position.set(0, 2.05, 0.38);
  dino.add(head);
  box(0.86, 0.56, 0.78, steel, head);
  box(0.7, 0.28, 0.08, dark, head, 0, 0.025, 0.41);
  for (const x of [-0.21, 0.21]) {
    const lens = cylinder(0.115, 0.115, 0.045, trim, head, x, 0.035, 0.46);
    lens.rotation.x = Math.PI / 2;
    const eye = sphere(0.082, green, head, x, 0.035, 0.49);
    eye.scale.z = 0.45;
  }
  box(0.7, 0.22, 0.75, dark, head, 0, -0.18, 0.25);
  for (const x of [-0.42, 0.42]) {
    const cap = cylinder(0.12, 0.12, 0.035, graphite, head, x, 0.05, 0.14);
    cap.rotation.z = Math.PI / 2;
    const hub = cylinder(0.057, 0.057, 0.04, silver, head, x * 1.06, 0.05, 0.14);
    hub.rotation.z = Math.PI / 2;
  }
  for (let i = 0; i < 4; i++) {
    const s = mesh(
      new T.ConeGeometry(0.15, 0.32, 4),
      trim,
      dino,
      0,
      1.5 - i * 0.12,
      -0.3 - i * 0.2,
    );
    s.rotation.x = -0.5;
  }
  const tail = mesh(
    new T.ConeGeometry(0.27, 1.3, 12),
    steel,
    dino,
    0,
    0.85,
    -0.95,
  );
  tail.rotation.x = -1.2;
  for (const x of [-0.6, 0.6]) {
    sphere(0.13, trim, dino, x, 1.3, 0.14);
    const arm = box(0.13, 0.4, 0.13, steel, dino, x, 1.12, 0.3);
    arm.rotation.x = -0.6;
  }
  // A working product represented by a dimensional terminal and a phone.
  const terminal = groups.produto;
  box(0.2, 0.85, 0.2, trim, terminal, 0, 0.8, 0);
  box(1.1, 0.12, 0.7, steel, terminal, 0, 0.39, 0);
  const screen = new T.Group();
  screen.position.set(0, 1.6, 0);
  screen.rotation.y = 0.22;
  terminal.add(screen);
  box(2.05, 1.38, 0.16, dark, screen);
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 640;
  screenCanvas.height = 400;
  const ctx = screenCanvas.getContext("2d")!;
  ctx.fillStyle = "#e7ece4";
  ctx.fillRect(0, 0, 640, 400);
  ctx.fillStyle = "#163d35";
  ctx.fillRect(0, 0, 150, 400);
  ctx.fillStyle = "#c9ff3d";
  ctx.font = "bold 25px sans-serif";
  ctx.fillText("LAB / OS", 18, 46);
  ctx.fillStyle = "#9cbbb0";
  for (let i = 0; i < 5; i++)
    ctx.fillRect(20, 90 + i * 40, 90 - (i % 2) * 20, 8);
  ctx.fillStyle = "#263d35";
  ctx.font = "bold 27px sans-serif";
  ctx.fillText("Sua ideia, em operação.", 180, 53);
  ctx.fillStyle = "#b1cebd";
  for (let i = 0; i < 3; i++) ctx.fillRect(180 + i * 145, 85, 125, 60);
  ctx.strokeStyle = "#477f61";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(185, 280);
  ctx.bezierCurveTo(280, 320, 360, 145, 580, 182);
  ctx.stroke();
  ctx.fillStyle = "#cdd7c9";
  for (let i = 0; i < 3; i++) ctx.fillRect(180, 326 + i * 20, 390 - i * 28, 8);
  const texture = new T.CanvasTexture(screenCanvas);
  texture.colorSpace = T.SRGBColorSpace;
  textures.push(texture);
  const sm = new T.MeshBasicMaterial({ map: texture });
  mats.push(sm);
  mesh(new T.PlaneGeometry(1.9, 1.22), sm, screen, 0, 0, 0.09);
  const phone = box(0.5, 0.92, 0.1, steel, terminal, 0.95, 0.8, 0.55);
  phone.rotation.z = -0.2;
  box(0.35, 0.65, 0.015, blue, phone, 0, 0, 0.06);
  // Miniature castle emerging from an illuminated portal.
  const castle = groups.morvelio;
  const gate = mesh(
    new T.TorusGeometry(1.1, 0.12, 12, 64),
    trim,
    castle,
    0,
    1.62,
    -0.45,
  );
  mesh(new T.TorusGeometry(0.96, 0.045, 8, 64), purple, castle, 0, 1.62, -0.42);
  const glow = new T.PointLight(0xa770ff, 2, 4);
  glow.position.set(0, 1.5, -0.1);
  castle.add(glow);
  box(1.25, 0.85, 0.75, stone, castle, 0, 0.78, 0.2);
  box(0.3, 0.52, 0.035, dark, castle, 0, 0.63, 0.59);
  for (const x of [-0.66, 0.66]) {
    cylinder(0.24, 0.26, 1.2, stone, castle, x, 0.98, 0.28, 8);
    mesh(new T.ConeGeometry(0.37, 0.57, 8), roof, castle, x, 1.86, 0.28);
  }
  box(0.62, 1.4, 0.6, stone, castle, 0, 1.02, -0.26);
  mesh(
    new T.ConeGeometry(0.55, 0.68, 4),
    roof,
    castle,
    0,
    2.05,
    -0.26,
  ).rotation.y = Math.PI / 4;
  for (const x of [-0.45, -0.15, 0.15, 0.45])
    box(0.16, 0.17, 0.17, stone, castle, x, 1.29, 0.5);
  for (const x of [-0.66, 0.66])
    box(0.09, 0.24, 0.025, blue, castle, x, 1.22, 0.53);
  const orb = sphere(0.16, purple, castle, 0, 2.6, -0.43);
  // Machined details: segmented armor, servos, vents and separate rubber contact pads.
  for (const x of [-0.39, 0.39]) {
    const hip = cylinder(0.18, 0.18, 0.09, graphite, dino, x * 1.35, 0.6, 0.02);
    hip.rotation.z = Math.PI / 2;
    const axle = cylinder(0.08, 0.08, 0.105, silver, dino, x * 1.45, 0.6, 0.02);
    axle.rotation.z = Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      box(0.075, 0.08, 0.21, silver, dino, x - 0.12 + i * 0.12, 0.36, 0.6);
      box(0.08, 0.035, 0.21, rubber, dino, x - 0.12 + i * 0.12, 0.305, 0.6);
    }
    for (let i = 0; i < 3; i++) {
      const armor = box(0.11, 0.16, 0.38, steel, dino, x * 1.12, 0.98 + i * 0.16, -0.06);
      armor.rotation.z = x > 0 ? -0.2 : 0.2;
    }
  }
  for (let i = 0; i < 5; i++) box(0.35, 0.022, 0.03, graphite, head, 0, 0.13 - i * 0.055, -0.4);
  for (const x of [-0.32, 0.32]) {
    for (const y of [-0.16, 0.2]) {
      const screw = cylinder(0.022, 0.022, 0.018, silver, head, x, y, 0.398, 8);
      screw.rotation.x = Math.PI / 2;
    }
  }
  // Segmented neck and articulated forearms.
  for (let i = 0; i < 4; i++) cylinder(0.23, 0.23, 0.055, graphite, dino, 0, 1.45 + i * 0.12, 0.18 + i * 0.04);
  for (const x of [-0.63, 0.63]) {
    sphere(0.11, graphite, dino, x, 0.98, 0.41);
    box(0.19, 0.13, 0.23, steel, dino, x, 0.94, 0.52);
    for (const offset of [-0.055, 0.055]) box(0.045, 0.13, 0.14, silver, dino, x + offset, 0.89, 0.64);
  }
  // Camera module, subtle status lamp and a raised top shell.
  box(0.53, 0.055, 0.51, steel, head, 0, 0.3, -0.035);
  box(0.12, 0.026, 0.03, green, head, 0, 0.28, 0.34);

  // Product workstation: a recessed display, separate keyboard and functional-looking phone.
  box(2.1, 0.035, 0.19, silver, screen, 0, -0.7, 0);
  sphere(0.018, graphite, screen, 0, 0.65, 0.09);
  for (let i = 0; i < 7; i++) box(0.11, 0.012, 0.02, graphite, screen, -0.4 + i * 0.13, -0.655, 0.09);
  const keyboard = new T.Group();
  keyboard.position.set(-0.1, 0.4, 0.75);
  keyboard.rotation.x = 0.08;
  terminal.add(keyboard);
  box(1.3, 0.075, 0.46, silver, keyboard);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 11; col++) box(0.085, 0.025, 0.08, graphite, keyboard, -0.53 + col * 0.106, 0.05, -0.13 + row * 0.115);
  }
  box(0.43, 0.025, 0.05, graphite, keyboard, 0, 0.05, 0.185);
  const mouse = sphere(0.13, steel, terminal, 0.84, 0.43, 0.92);
  mouse.scale.set(0.7, 0.4, 1.25);
  box(0.02, 0.035, 0.06, graphite, terminal, 0.84, 0.485, 0.93);
  box(0.32, 0.045, 0.02, graphite, phone, 0, 0.32, 0.075);
  box(0.13, 0.018, 0.02, silver, phone, 0, -0.37, 0.075);
  for (let i = 0; i < 3; i++) {
    box(0.23, 0.09, 0.016, i === 0 ? green : dark, phone, 0, 0.17 - i * 0.16, 0.075);
    box(0.13, 0.018, 0.018, silver, phone, -0.025, 0.17 - i * 0.16, 0.086);
  }

  // Miniature architecture: foundation, individual masonry courses, stairs and roof collars.
  const masonry = material(0x756e5c, 0.02, 0.95);
  const foliage = material(0x344b38, 0.02, 0.9);
  cylinder(1.03, 1.14, 0.14, masonry, castle, 0, 0.36, 0, 32);
  for (let i = 0; i < 5; i++) box(0.5, 0.055, 0.16, stone, castle, 0, 0.32 + i * 0.038, 1.03 - i * 0.12);
  for (const x of [-0.66, 0.66]) {
    for (const y of [0.5, 0.84, 1.16, 1.55]) cylinder(0.259, 0.259, 0.045, masonry, castle, x, y, 0.28, 16);
    cylinder(0.28, 0.28, 0.08, stone, castle, x, 1.57, 0.28, 16);
    for (let i = 0; i < 3; i++) {
      const r = 0.34 - i * 0.084;
      cylinder(r, r + 0.02, 0.024, trim, castle, x, 1.63 + i * 0.16, 0.28, 16);
    }
    cylinder(0.025, 0.025, 0.23, trim, castle, x, 2.17, 0.28, 12);
    sphere(0.045, trim, castle, x, 2.29, 0.28);
    box(0.075, 0.2, 0.03, warmLight, castle, x, 1.21, 0.548);
  }
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const x = -0.5 + col * 0.25 + (row % 2) * 0.045;
      if (Math.abs(x) > 0.22) box(0.21, 0.013, 0.015, masonry, castle, x, 0.58 + row * 0.15, 0.585);
    }
  }
  // Door arch assembled from wedge stones around a recessed oak door.
  const oak = material(0x302820, 0.03, 0.85);
  box(0.26, 0.4, 0.04, oak, castle, 0, 0.67, 0.6);
  for (const x of [-0.17, 0.17]) box(0.065, 0.37, 0.075, masonry, castle, x, 0.66, 0.63);
  for (let i = 0; i < 7; i++) {
    const a = i / 6 * Math.PI;
    const brick = box(0.09, 0.1, 0.08, stone, castle, Math.cos(a) * 0.17, 0.84 + Math.sin(a) * 0.17, 0.63);
    brick.rotation.z = a - Math.PI / 2;
  }
  for (const y of [0.57, 0.75]) box(0.25, 0.022, 0.016, graphite, castle, 0, y, 0.63);
  for (const x of [-0.055, 0.055]) sphere(0.018, trim, castle, x, 0.68, 0.641);
  // Garden and stone outcrops are deliberately sparse to preserve the architecture.
  for (let i = 0; i < 8; i++) {
    const a = 0.3 + i / 7 * Math.PI * 1.35;
    const rock = mesh(new T.DodecahedronGeometry(0.15 + (i % 3) * 0.035), masonry, castle, Math.cos(a) * 0.95, 0.41, Math.sin(a) * 0.85);
    rock.rotation.set(i * 0.3, i, 0.4);
  }
  for (const [x, z, height] of ([[-0.92,-0.2,0.55],[0.87,-0.36,0.75],[-0.66,-0.72,0.48]] as const)) {
    cylinder(0.025, 0.035, height, oak, castle, x, 0.45 + height * 0.3, z, 8);
    for (let i = 0; i < 3; i++) mesh(new T.ConeGeometry(0.2 - i * 0.04, height * 0.6, 7), foliage, castle, x, 0.57 + i * height * 0.2, z);
  }
  // Engraved portal housing, fasteners and inner facets.
  gate.material = graphite;
  mesh(new T.TorusGeometry(1.18, 0.025, 8, 96), trim, castle, 0, 1.62, -0.45);
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * Math.PI * 2;
    const rune = box(0.022, 0.07, 0.035, i % 5 === 0 ? purple : silver, castle, Math.cos(a) * 1.105, 1.62 + Math.sin(a) * 1.105, -0.315);
    rune.rotation.z = a - Math.PI / 2;
  }
  // Front identification plates: texture labels avoid floating interface in the world.
  for (const [index, g] of Object.values(groups).entries()) {
    const plaqueCanvas = document.createElement("canvas");
    plaqueCanvas.width = 256; plaqueCanvas.height = 64;
    const pc = plaqueCanvas.getContext("2d")!;
    pc.fillStyle = "#151d19"; pc.fillRect(0, 0, 256, 64);
    pc.fillStyle = "#b5bcae"; pc.font = "20px monospace";
    pc.fillText((["01 / LAB", "02 / DIGITAL", "03 / MUNDOS"][index] ?? "LAB"), 18, 41);
    const tx = new T.CanvasTexture(plaqueCanvas); tx.colorSpace = T.SRGBColorSpace; textures.push(tx);
    const pm = new T.MeshBasicMaterial({map:tx}); mats.push(pm);
    mesh(new T.PlaneGeometry(0.72, 0.18), pm, g, 0, 0.095, 1.278);
  }
  const ray = new T.Raycaster();
  const pointer = new T.Vector2();
  let selection: Station = "lab",
    running = true,
    visible = true,
    raf = 0,
    disposed = false;
  const viewpoints: Record<Station, [number, number, number]> = {
    lab: [2.8, 4.8, 10.6],
    produto: [-4.4, 3.7, 7.5],
    morvelio: [5.6, 3.8, 7.6],
  };
  let rotation = 0;
  let dragStart: {x: number; rotation: number} | null = null;
  let dragged = false;
  function draw(time = 0) {
    if (disposed) return;
    camera.position.lerp(desired, running ? 0.045 : 1);
    target.lerp(aim, running ? 0.055 : 1);
    camera.lookAt(target);
    if (Math.abs(root.rotation.y - rotation) > 0.0005) {
      root.rotation.y = T.MathUtils.lerp(root.rotation.y, rotation, running ? 0.12 : 1);
      renderer.shadowMap.needsUpdate = true;
    }
    if (running) {
      head.rotation.y = Math.sin(time * 0.0005) * 0.12;
      orb.position.y = 2.6 + Math.sin(time * 0.0015) * 0.08;
      gate.rotation.z = Math.sin(time * 0.0003) * 0.025;
    }
    renderer.render(scene, camera);
    if (running && visible) raf = requestAnimationFrame(draw);
  }
  function schedule() {
    cancelAnimationFrame(raf);
    if (visible) draw();
  }
  const resize = new ResizeObserver(() => {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    schedule();
  });
  resize.observe(host);
  const observer = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting && !document.hidden;
    schedule();
  });
  observer.observe(host);
  const visibility = () => {
    visible =
      !document.hidden &&
      host.getBoundingClientRect().bottom > 0 &&
      host.getBoundingClientRect().top < innerHeight;
    schedule();
  };
  document.addEventListener("visibilitychange", visibility);
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragStart = {x: e.clientX, rotation};
    dragged = false;
    renderer.domElement.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!dragStart) return;
    const distance = e.clientX - dragStart.x;
    if (Math.abs(distance) > 5) dragged = true;
    if (!dragged) return;
    rotation = T.MathUtils.clamp(dragStart.rotation + distance * 0.004, -0.6, 0.6);
    if (!running) schedule();
  };
  const cancel = () => { dragStart = null; };
  const click = (e: PointerEvent) => {
    dragStart = null;
    if (renderer.domElement.hasPointerCapture(e.pointerId)) renderer.domElement.releasePointerCapture(e.pointerId);
    if (dragged) { dragged = false; return; }
    const r = host.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(Object.values(groups), true)[0];
    let o: T.Object3D | null = hit?.object ?? null;
    while (o) {
      if (o.userData["station"]) {
        choose(o.userData["station"] as Station);
        break;
      }
      o = o.parent;
    }
  };
  renderer.domElement.addEventListener("pointerdown", down);
  renderer.domElement.addEventListener("pointermove", move);
  renderer.domElement.addEventListener("pointercancel", cancel);
  renderer.domElement.addEventListener("pointerup", click);
  return {
    select(id: Station) {
      selection = id;
      rotation = 0;
      desired.set(...viewpoints[selection]);
      if (id === "lab") aim.set(0, 1.05, 0);
      else aim.copy(groups[id].position).multiplyScalar(0.83).add(new T.Vector3(0, 1.25, 0));
      schedule();
    },
    motion(value: boolean) {
      running = value;
      schedule();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointercancel", cancel);
      renderer.domElement.removeEventListener("pointerup", click);
      geometries.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
