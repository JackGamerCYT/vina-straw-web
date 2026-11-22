"use client";
import { useEffect, useRef, useState } from "react";
import { Rotate3d } from "lucide-react";

type Shape = "bowl" | "cup" | "chen" | "plate";
export const SHAPES: Record<string, Shape> = { "to-rom-500ml": "bowl", "ly-rom-250ml": "cup", "chen-rom-250ml": "chen", "dia-rom-220": "plate" };

/** Xem 3D: kéo để xoay. Hình học theo bản vẽ (mm). Chỉ tải three.js khi người xem bấm mở. */
export function Viewer3D({ shape }: { shape: Shape }) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    let stop = () => {};
    (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const el = box.current!;
      const W = el.clientWidth, H = el.clientHeight;
      const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      r.setPixelRatio(Math.min(2, window.devicePixelRatio)); r.setSize(W, H);
      r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
      r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
      el.appendChild(r.domElement);
      const scene = new THREE.Scene();
      const pm = new THREE.PMREMGenerator(r);
      scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.4;

      // vân sợi rơm
      const S = 1024, c = document.createElement("canvas"); c.width = c.height = S;
      const g = c.getContext("2d")!; g.fillStyle = "#cfb27a"; g.fillRect(0, 0, S, S);
      const cols = ["#a8813f", "#efe0b4", "#93692c", "#f6ecd0", "#7a5621", "#c9a35c"];
      for (let i = 0; i < 7000; i++) {
        const x = Math.random() * S, y = Math.random() * S, l = 6 + Math.random() * 22, a = Math.random() * Math.PI * 2;
        g.strokeStyle = cols[(Math.random() * cols.length) | 0]; g.globalAlpha = 0.5 + Math.random() * 0.5; g.lineWidth = 0.6 + Math.random() * 1.6;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 3);
      const mat = new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 1.5, roughness: 0.88, side: THREE.DoubleSide });

      const prof: Record<Shape, [number, number][]> = {
        bowl: [[0, 0], [40, 0], [46, 3], [60, 18], [72, 36], [78, 52], [80, 60]],
        cup: [[0, 0], [29, 0], [30, 4], [35, 44], [41, 88]],
        chen: [[0, 7], [28, 7], [30, 1], [34, 0], [36, 7], [48, 17], [56, 37], [60, 55], [60, 62]],
        plate: [[0, 0], [62, 0], [68, 2], [76, 12], [84, 18], [110, 22]],
      };
      const t = shape === "plate" ? 2 : 2.3;
      const curve = new THREE.SplineCurve(prof[shape].map(([x, y]) => new THREE.Vector2(x, y)));
      const outer = curve.getPoints(48);
      const inner = outer.slice().reverse().map((v) => new THREE.Vector2(Math.max(0, v.x - t), Math.max(t, v.y + (v.x < 1 ? t : 0))));
      const geo = new THREE.LatheGeometry([...outer, ...inner], 160);
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true;
      const top = outer[outer.length - 1];
      const rim = new THREE.Mesh(new THREE.TorusGeometry(top.x - t / 2, t, 20, 160), mat); rim.rotation.x = Math.PI / 2; rim.position.y = top.y;
      const grp = new THREE.Group(); grp.add(mesh, rim); scene.add(grp);
      const bb = new THREE.Box3().setFromObject(grp); const ctr = bb.getCenter(new THREE.Vector3()); const rad = bb.getSize(new THREE.Vector3()).length() / 2;

      scene.add(new THREE.HemisphereLight(0xfff6e6, 0x8fa384, 0.9));
      const key = new THREE.DirectionalLight(0xfff1dc, 2.4); key.position.set(-rad * 2, rad * 3, rad * 1.5); key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048); const sc = key.shadow.camera; sc.left = sc.bottom = -rad * 2; sc.right = sc.top = rad * 2; key.shadow.radius = 10; key.shadow.bias = -0.0004;
      scene.add(key);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(rad * 10, rad * 10), new THREE.ShadowMaterial({ opacity: 0.25 }));
      ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

      const cam = new THREE.PerspectiveCamera(32, W / H, 1, 5000);
      cam.position.set(ctr.x + rad * 1.6, ctr.y + rad * 1.6, ctr.z + rad * 2.4);
      const ctl = new OrbitControls(cam, r.domElement); ctl.target.copy(ctr); ctl.enableDamping = true; ctl.autoRotate = true; ctl.autoRotateSpeed = 1.6;
      ctl.minDistance = rad * 1.6; ctl.maxDistance = rad * 6; ctl.maxPolarAngle = Math.PI * 0.49; ctl.enablePan = false;
      let raf = 0;
      const loop = () => { ctl.update(); r.render(scene, cam); raf = requestAnimationFrame(loop); };
      loop();
      const onResize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
      window.addEventListener("resize", onResize);
      stop = () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); ctl.dispose(); r.dispose(); el.innerHTML = ""; };
    })();
    return () => stop();
  }, [on, shape]);

  return (
    <div className="relative aspect-square overflow-hidden rounded-[28px] bg-mist">
      <div ref={box} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      {!on && (
        <button onClick={() => setOn(true)} className="absolute inset-0 grid place-items-center text-leaf-800">
          <span className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold shadow-lg transition hover:-translate-y-0.5"><Rotate3d className="h-5 w-5" /> Xoay mô hình 3D</span>
        </button>
      )}
      {on && <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-sm text-ink-soft">Kéo để xoay · cuộn để phóng to</p>}
    </div>
  );
}
