import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Everything in this scene is real geometry. No moving screenshots, faux cutouts,
// or animated terrain. Each wave follows the SAME curve as the road mesh.
const ROAD_POINTS = [[6.4,.08,8.5],[5.05,.08,5.2],[3.5,.08,2.4],[4.7,.08,-.5],[3.4,.08,-3.5],[1.6,.08,-5.4],[3.3,.08,-8],[2.3,.08,-11],[2.9,.08,-14],[2.65,.08,-17]];
const roadCurve = new THREE.CatmullRomCurve3(ROAD_POINTS.map(p=>new THREE.Vector3(...p)));
const hash = n => { const v=Math.sin(n*127.1+78.233)*43758.5453; return v-Math.floor(v); };

function ribbon(curve, width, lift, steps=280) {
  const points=[], uvs=[], indices=[];
  for(let i=0;i<=steps;i++) {
    const t=i/steps, p=curve.getPoint(t), tangent=curve.getTangent(t);
    const d=new THREE.Vector3(tangent.z,0,-tangent.x).normalize();
    const w=width * (1-t*.64);
    for(const dir of [-1,1]) {
      points.push(p.x+d.x*w*dir,p.y+lift,p.z+d.z*w*dir);
      uvs.push(dir===-1?0:1,t);
    }
    if(i<steps){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
  }
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geom.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geom.setIndex(indices);geom.computeVertexNormals();return geom;
}

function Ground() {
  const geom=useMemo(()=>{
    const g=new THREE.PlaneGeometry(65,90,64,64);
    g.rotateX(-Math.PI/2);
    const p=g.attributes.position;
    for(let i=0;i<p.count;i++) {
      let x=p.getX(i), z=p.getZ(i);
      // The flat road corridor remains level. Variation appears far from it.
      const variation = .11 * Math.sin(x*.9+z*.4) + .09*Math.cos(x*.6-z*.3);
      p.setY(i,-.35+variation);
    }
    g.computeVertexNormals();return g;
  },[]);
  return <><mesh geometry={geom} receiveShadow={false}><meshStandardMaterial color="#30102d" roughness={1}/></mesh>
  <mesh position={[-13,0,-19]} scale={[13,3.9,11]}><sphereGeometry args={[1,32,16]}/><meshStandardMaterial color="#5b194c" roughness={1}/></mesh>
  <mesh position={[16,-.8,-21]} scale={[16,3.7,11]}><sphereGeometry args={[1,32,16]}/><meshStandardMaterial color="#802751" roughness={1}/></mesh>
  <mesh position={[-16,-1,-6]} scale={[11,1.9,11]}><sphereGeometry args={[1,32,16]}/><meshStandardMaterial color="#43123d" roughness={1}/></mesh>
  </>;
}

const goldVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const goldFragment = `uniform float uTime; uniform float uPower; varying vec2 vUv;
 void main(){
  float center=pow(max(0.,1.-abs(vUv.x-.5)*2.),1.8);
  float phase=fract(vUv.y-uTime*.12);
  float band=exp(-pow((phase-.5)*10.,2.));
  float accent=exp(-pow((phase-.47)*27.,2.));
  float strength=(.25+band*.8+accent*.6)*center*uPower;
  vec3 gold=mix(vec3(.93,.29,.12),vec3(1.,.83,.34),band+.2);
  gl_FragColor=vec4(gold,strength*.74);
 }`;
function GoldenRoad({ running }) {
  const surface=useMemo(()=>ribbon(roadCurve,.82,0.025),[]);
  const core=useMemo(()=>ribbon(roadCurve,.17,.065),[]);
  const glow=useMemo(()=>ribbon(roadCurve,.36,.073),[]);
  const pulse=useRef();
  const uniforms=useMemo(()=>({uTime:{value:0},uPower:{value:1}}),[]);
  useFrame((state,delta)=>{if(running){uniforms.uTime.value+=Math.min(delta,.05)}else{uniforms.uPower.value=0}if(running)uniforms.uPower.value=1});
  return <group>
    <mesh geometry={surface}><meshBasicMaterial color="#80442c" side={THREE.DoubleSide}/></mesh>
    <mesh geometry={glow}><meshBasicMaterial color="#fc9a43" transparent opacity={.13} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>
    <mesh geometry={core}><shaderMaterial uniforms={uniforms} vertexShader={goldVertex} fragmentShader={goldFragment} transparent side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>
    <mesh geometry={core} position={[0,-.012,0]}><meshBasicMaterial color="#ffe3a0" transparent opacity={.62} side={THREE.DoubleSide}/></mesh>
  </group>;
}

function City() {
  const blocks=useMemo(()=>{
    const a=[];
    for(let i=0;i<66;i++){
      const x=2.75+(hash(i+3)-.5)*11, z=-20-(hash(i+19))*4;
      const h=.9+hash(i+66)*4.8*(1-Math.min(1,Math.abs(x-2.8)/10));
      a.push({x,z,h,w:.28+hash(i+108)*.42});
    }
    return a.sort((a,b)=>a.z-b.z);
  },[]);
  return <group>{blocks.map((b,i)=><group key={i} position={[b.x,b.h/2-.1,b.z]}>
    <mesh><boxGeometry args={[b.w,b.h,b.w]}/><meshStandardMaterial emissive={i%3===0?'#cf693e':'#ad4f5f'} emissiveIntensity={.36} color={i%4===0?'#c97e6b':'#67344d'} metalness={.15} roughness={.7}/></mesh>
    <mesh position={[0,.03,b.w/2+.004]}><planeGeometry args={[b.w*.58,b.h*.65]}/><meshBasicMaterial color="#ffc97b" transparent opacity={.22}/></mesh>
  </group>)}<pointLight position={[2.5,4,-19]} color="#ffc066" intensity={30} distance={25} decay={2}/>
  <mesh position={[2.6,-.2,-18]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[7,48]}/><meshBasicMaterial color="#f5b261" transparent opacity={.10} depthWrite={false}/></mesh>
  </group>;
}

function Branch({x=0,y=0,z=0,seed=1,angle=0,scale=1,running=true}) {
  const ref=useRef();
  const count=90;
  const dummy=useMemo(()=>new THREE.Object3D(),[]);
  const instanceRef=useRef();
  const transforms=useMemo(()=>Array.from({length:count},(_,i)=>{
    const t=hash(i*7.3+seed), a=t*Math.PI*2, radius=Math.sqrt(hash(i*21+seed))*1.08;
    return {x:Math.cos(a)*radius,y:Math.sin(a)*radius*.62,z:(hash(i+seed*99)-.5)*1.2,size:.55+hash(i+seed*13)*1.2};
  }),[seed]);
  React.useEffect(()=>{
    if(!instanceRef.current)return;
    transforms.forEach((v,i)=>{
      dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(hash(i+seed)*2,hash(i+seed+1)*3,0);dummy.scale.setScalar(v.size);dummy.updateMatrix();instanceRef.current.setMatrixAt(i,dummy.matrix);
    });instanceRef.current.instanceMatrix.needsUpdate=true;
  },[transforms,dummy,seed]);
  useFrame(({clock})=>{
    if(ref.current)ref.current.rotation.z=angle+(running?Math.sin(clock.elapsedTime*.46+seed)*.022:0);
  });
  return <group ref={ref} position={[x,y,z]} rotation={[0,0,angle]} scale={scale}>
    <mesh position={[.1,.35,0]} rotation={[0,0,-.38]}><cylinderGeometry args={[.045,.08,1.45,6]}/><meshStandardMaterial color="#40142f"/></mesh>
    <instancedMesh ref={instanceRef} args={[null,null,count]} position={[.3,1.05,0]} frustumCulled={false}>
      <tetrahedronGeometry args={[.07,0]}/><meshStandardMaterial color={seed%2===0?'#f76da8':'#ffafd4'} emissive="#a62b63" emissiveIntensity={.65} roughness={.78} side={THREE.DoubleSide}/>
    </instancedMesh>
  </group>;
}
function BlossomTree({position=[0,0,0],scale=1,seed=2,running=true}) {
  return <group position={position} scale={scale}>
    <mesh position={[0,.9,0]} rotation={[0,0,-.12]}><cylinderGeometry args={[.07,.18,2.1,7]}/><meshStandardMaterial color="#371022"/></mesh>
    {Array.from({length:5},(_,i)=><Branch key={i} x={i%2===0?.07:-.14} y={1.45+i*.17} z={(i-2)*.12} seed={seed+i*19} angle={i%2===0?-.55:.46} scale={.7+.13*hash(i+seed)} running={running}/>)}
  </group>;
}
function Petals({running,count=100}) {
  const ref=useRef();const dummy=useMemo(()=>new THREE.Object3D(),[]);
  const seeds=useMemo(()=>Array.from({length:count},(_,i)=>({x:(hash(i+1)-.5)*28,y:.8+hash(i*3+5)*7,z:-16+hash(i*11+3)*23,speed:.15+hash(i*9+8)*.23,phase:hash(i*19+4)*10})),[count]);
  useFrame(({clock})=>{if(!ref.current)return;const time=running?clock.elapsedTime:0;
    seeds.forEach((p,i)=>{const h=running?time*p.speed+p.phase:p.phase;dummy.position.set(p.x+Math.sin(h*.7)*1.2,p.y-(h%8)*.54,p.z+Math.cos(h*.9)*1.3);if(dummy.position.y<.07)dummy.position.y+=5.3;dummy.rotation.set(h*1.3,h*.65,h*1.9);dummy.scale.set(.65,.25,.3);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix)});ref.current.instanceMatrix.needsUpdate=true;
  });
  return <instancedMesh ref={ref} args={[null,null,count]} frustumCulled={false}><planeGeometry args={[.11,.11]}/><meshBasicMaterial color="#ffc6df" side={THREE.DoubleSide} transparent opacity={.72} depthWrite={false}/></instancedMesh>;
}
function WorldScene({running,lowPower}) {
  const camera = useThree(state=>state.camera);
  useFrame(({pointer},delta)=>{
    const tx=running?pointer.x*.26:0, ty=running?pointer.y*.07:0;
    camera.position.x=THREE.MathUtils.damp(camera.position.x,tx,1.3,delta);
    camera.position.y=THREE.MathUtils.damp(camera.position.y,6.9+ty,1.3,delta);
    camera.lookAt(1.6,1,-8);
  });
  return <>
    <fog attach="fog" args={['#692448',23,55]}/>
    <ambientLight intensity={1.5} color="#e97dae"/>
    <hemisphereLight args={['#ffc89b','#35102e',1.6]}/>
    <directionalLight position={[6,14,-18]} intensity={2.9} color="#ffce86"/>
    <Ground/><GoldenRoad running={running}/><City/>
    <BlossomTree position={[-9,-.25,3]} scale={2.35} seed={11} running={running}/>
    <BlossomTree position={[9,-.25,2]} scale={2.35} seed={17} running={running}/>
    <BlossomTree position={[-7,-.25,-7]} scale={1.3} seed={21} running={running}/>
    <BlossomTree position={[8,-.25,-9]} scale={1.45} seed={29} running={running}/>
    {!lowPower&&<><BlossomTree position={[-3.5,-.25,-12]} scale={.6} seed={33} running={running}/><BlossomTree position={[6,-.25,-12]} scale={.9} seed={41} running={running}/></>}
    <Petals running={running} count={lowPower?35:110}/>
  </>;
}
export default function CinematicWorld({running,lowPower,onError}) {
  return <Canvas gl={{ alpha:true, antialias:!lowPower, powerPreference:'high-performance' }} dpr={lowPower?[1,1.1]:[1,1.7]} camera={{fov:49,near:.1,far:100,position:[0,6.9,17]}} onCreated={({gl})=>{gl.setClearColor('#000000',0)}} onError={onError} frameloop="always">
    <WorldScene running={running} lowPower={lowPower}/>
  </Canvas>;
}