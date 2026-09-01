// ADUGAME G1R2 v16.1 — authored CC0 3D assets only; ZERO generated/drawn visual assets.
// Bathroom: Tiny Treats Bubbly Bathroom (CC0). Character: KayKit Adventurers Rogue (CC0).
(() => {
  if (typeof G1R2 !== 'function') return;

  const TT='https://raw.githubusercontent.com/TinyTreats-Game-Assets/Tiny-Treats-Bubbly-Bathroom-1.0/main/addons/tiny_treats_bubbly_bathroom_set/Assets/gltf/';
  const KAY='https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf/Rogue.glb';
  const THREE_URL='https://esm.sh/three@0.180.0';
  const LOADER_URL='https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

  const authored=[
    ['floor','floor_tiled.gltf'],['wall','wall_tiled_corner_inner.gltf'],['cabinet','cabinet_bathroom.gltf'],
    ['mirror','mirror.gltf'],['bath','bath.gltf'],['shelf','wall_shelf.gltf'],['towels','towel_stacked.gltf'],
    ['plant','plant.gltf'],['cup','toothbrush_cup_decorated.gltf'],['brush','toothbrush_blue.gltf'],
    ['bottleBlue','container_bathroom_A_blue.gltf'],['bottlePink','container_bathroom_B_pink.gltf'],
    ['mat','mat.gltf'],['slippers','slippers.gltf'],['ducky','ducky.gltf']
  ];

  function syncRoot(scene,root){
    const canvas=scene.game?.canvas;if(!canvas)return;
    const r=canvas.getBoundingClientRect();
    Object.assign(root.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});
  }

  async function mount(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v16Mounting||scene.__g1v16Root)return;
    scene.__g1v16Mounting=true;
    let root=null,raf=0;
    try{
      const [THREE,loaderMod]=await Promise.all([import(THREE_URL),import(LOADER_URL)]);
      if(!scene.sys?.isActive()||scene.scene?.key!=='G1R2')return;
      const {GLTFLoader}=loaderMod;
      root=document.createElement('div');
      root.id='g1r2-v16-three';root.dataset.generatedVisualAssets='0';root.dataset.ready='0';
      Object.assign(root.style,{position:'fixed',overflow:'hidden',pointerEvents:'none',zIndex:'76',display:'none',background:'#f7f1df'});
      document.body.appendChild(root);syncRoot(scene,root);

      const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;
      renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xf7f1df,1);
      Object.assign(renderer.domElement.style,{width:'100%',height:'100%',display:'block',pointerEvents:'none'});root.appendChild(renderer.domElement);

      const world=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(31,16/9,.05,100);
      // First capture showed the authored wall from its exterior. v16.1 moves the camera to the room side.
      camera.position.set(5.2,3.15,-7.15);
      camera.lookAt(-.15,1.05,-.55);

      world.add(new THREE.HemisphereLight(0xffffff,0xb9c7d8,2.15));
      const key=new THREE.DirectionalLight(0xffffff,3.0);key.position.set(2.5,7,-5.5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);world.add(key);
      const fill=new THREE.DirectionalLight(0xffe7c2,1.2);fill.position.set(-5,3,-2);world.add(fill);

      const loader=new GLTFLoader(),loaded={};
      const entries=await Promise.all(authored.map(async ([name,file])=>[name,await loader.loadAsync(TT+file)]));
      for(const [name,gltf] of entries)loaded[name]=gltf.scene;
      const kidGltf=await loader.loadAsync(KAY);loaded.kid=kidGltf.scene;
      const prep=o=>{o.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});return o;};Object.values(loaded).forEach(prep);
      const put=(o,p,r=[0,0,0],s=1)=>{o.position.set(...p);o.rotation.set(...r);o.scale.setScalar(s);world.add(o);return o;};

      put(loaded.floor,[0,0,0]);put(loaded.wall,[0,0,0]);
      put(loaded.cabinet,[-1.65,0,-1.35]);put(loaded.mirror,[-1.65,1.78,-1.72]);
      put(loaded.bath,[1.25,0,-1.05],[0,-.16,0]);put(loaded.shelf,[-2.15,1.65,-1.78]);
      put(loaded.towels,[-2.05,1.66,-1.36]);put(loaded.plant,[2.38,0,-1.38]);
      put(loaded.cup,[-1.18,1.08,-1.1]);put(loaded.brush,[-1.05,1.22,-1.02],[0,0,-.12],1.18);
      put(loaded.bottleBlue,[-1.52,1.13,-1.08]);put(loaded.bottlePink,[-1.78,1.13,-1.06]);
      put(loaded.mat,[.05,.02,.7]);put(loaded.slippers,[1.1,.03,.72],[0,-.22,0]);put(loaded.ducky,[1.25,.72,-.92],[0,.25,0]);
      // Bring the authored character forward, full-body and facing the room-side camera.
      put(loaded.kid,[.72,.03,-.05],[0,Math.PI+.12,0],1.18);

      if(kidGltf.animations?.length){
        const clip=kidGltf.animations.find(c=>/idle/i.test(c.name))||kidGltf.animations[0];
        const mixer=new THREE.AnimationMixer(loaded.kid);mixer.clipAction(clip).play();scene.__g1v16Mixer=mixer;
      }
      const resize=()=>{const w=Math.max(1,root.clientWidth),h=Math.max(1,root.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};resize();
      const old=scene.__g1v14Dom?.root;if(old)old.style.display='none';root.style.display='block';root.dataset.ready='1';
      scene.__g1v16Root=root;scene.__g1v16Renderer=renderer;scene.v16Art='tiny-treats-kaykit-authored-3d';
      window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
      window.__ADUGAME_ART_SOURCE__.G1R2={background:{name:'Tiny Treats - Bubbly Bathroom original GLTF models',author:'Tiny Treats',license:'CC0 1.0'},character:{name:'KayKit Adventurers - Rogue original GLB',author:'Kay Lousberg',license:'CC0 1.0'},props:{name:'Tiny Treats bathroom original GLTF models',license:'CC0 1.0',items:['toothbrush','toothbrush cup','towels','bathroom containers','mirror','bath','plant','mat','slippers','ducky']},version:'v16.1',generatedVisualAssets:0,rendering:'live WebGL render of external authored CC0 models'};

      const clock=new THREE.Clock();
      const frame=()=>{if(!scene.sys?.isActive()||scene.scene?.key!=='G1R2'||!root.isConnected)return;syncRoot(scene,root);resize();if(scene.__g1v16Mixer)scene.__g1v16Mixer.update(Math.min(clock.getDelta(),.05));renderer.render(world,camera);raf=requestAnimationFrame(frame);};frame();
      const cleanup=()=>{cancelAnimationFrame(raf);try{renderer.dispose();}catch{}root?.remove();if(old)old.style.display='';scene.__g1v16Root=null;scene.__g1v16Renderer=null;scene.__g1v16Mixer=null;};
      scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
    }catch(err){console.error('G1R2 v16 authored 3D mount failed',err);root?.remove();scene.__g1v16Mounting=false;}
  }

  const priorCreate=G1R2.prototype.create;
  G1R2.prototype.create=function(){priorCreate.call(this);this.time.delayedCall(700,()=>mount(this));};
  window.__ADUGAME_G1_BENCHMARK_ART_V16__={loaded:true,version:'16.1',generatedVisualAssets:0};
})();
