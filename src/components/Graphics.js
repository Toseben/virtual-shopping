import * as THREE from 'three'
import React, { useRef, Suspense, useEffect, useState, useMemo } from 'react'
import { Canvas, extend, useFrame, useThree, useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { PointerLockControls } from '../libs/PointerLockControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Effects from './Effects'
import Stacy from './Stacy'

extend({ OrbitControls })
function ControlsOrbit() {
  const controls = useRef()
  const { camera, gl } = useThree()

  useEffect(() => {
    camera.position.set(0, 500, 0)
    camera.fov = 50
    camera.updateProjectionMatrix()
  }, [])

  useFrame(() => controls.current.update())
  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
  )
}
extend({ PointerLockControls })
function ControlsPointer({ activate, setActivate, setStuck }) {
  const controls = useRef()
  const overlay = useRef(document.getElementById('overlay'))
  const { scene, camera, gl } = useThree()

  const prevTime = useRef(performance.now())
  const velocity = useRef(0)
  const [moveForward, setMoveForward] = useState(false)

  const raycaster = useMemo(() => new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 14), [])

  const objects = scene.children.filter(obj => obj.name === 'OSG_Scene')
  const boundaries = scene.children.filter(obj => obj.name === 'boundaries')

  const storePos = useRef()
  const storeRot = useRef()

  useFrame(() => {
    if (controls.current.isLocked === true) {
      raycaster.ray.origin.copy(controls.current.getObject().position);
      raycaster.ray.origin.y = 25;

      const lookAt = new THREE.Vector3(0, 0, -1);
      lookAt.applyQuaternion(camera.quaternion);
      lookAt.multiply(new THREE.Vector3(1, 0, 1)).normalize()
      raycaster.ray.direction.copy(lookAt)

      const intersections = objects.length ? raycaster.intersectObjects([...objects, ...boundaries], true) : []

      const time = performance.now();
      const delta = (time - prevTime.current) / 1000;

      velocity.current -= velocity.current * 15.0 * delta;

      if (moveForward && !intersections.length) velocity.current -= Number(moveForward) * 1000.0 * delta;
      if (intersections.length) {
        velocity.current *= 0.975;
      }

      if (moveForward && intersections.length) {
        setStuck(true)
      } else {
        setStuck(false)
      }

      controls.current.moveForward(- velocity.current * delta);

      prevTime.current = time;

      storePos.current = camera.position.clone()
      storeRot.current = camera.rotation.clone()
    }

  })

  useEffect(() => {
    camera.position.set(-45, 25, 134.75)
    camera.rotation.set(0.1475, 0, 0)
  }, [])

  useEffect(() => {
    if (activate) controls.current.lock()
  }, [activate])

  const onMouseDown = () => {
    setMoveForward(true)
  }

  const onMouseUp = () => {
    setMoveForward(false)
  }

  const onLock = () => { }

  const onUnlock = () => {
    setActivate(false)
    velocity.current = 0
    if (storePos.current) camera.position.copy(storePos.current)
    if (storeRot.current) camera.rotation.copy(storeRot.current)
    gl.render(scene, camera)
  }

  useEffect(() => {
    controls.current.addEventListener('lock', onLock);
    controls.current.addEventListener('unlock', onUnlock);

    document.addEventListener('pointerdown', onMouseDown)
    document.addEventListener('pointerup', onMouseUp)
    document.addEventListener('pointerout', onMouseUp)
    return () => {
      controls.current.removeEventListener('lock', onLock);
      controls.current.removeEventListener('unlock', onUnlock);

      document.removeEventListener('pointerdown', onMouseDown)
      document.removeEventListener('pointerup', onMouseUp)
      document.removeEventListener('pointerout', onMouseUp)
    }
  }, [])

  return (
    <pointerLockControls ref={controls} args={[camera, gl.domElement]} />
  )
}

function Model({ setLoaded, setProgress }) {
  const { scene } = useThree()

  const actions = useRef()
  const [mixer] = useState(() => new THREE.AnimationMixer())
  useFrame((state, delta) => mixer.update(delta))

  const gltf = useLoader(GLTFLoader, 'assets/LittlestTokyo.glb', loader => {
    loader.manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      setProgress(parseInt(Math.min(itemsLoaded / 14, 1) * 100));
    };

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('assets/draco/gltf/');
    loader.setDRACOLoader(dracoLoader)
  })

  const r = "/assets/envMap/";
  const urls = [r + "px.png", r + "nx.png",
  r + "py.png", r + "ny.png",
  r + "pz.png", r + "nz.png"];
  const [envMap] = useLoader(THREE.CubeTextureLoader, [urls])

  useEffect(() => {
    // scene.fog = new THREE.FogExp2(0xeeeeee, 0.01);

    gltf.scene.scale.set(0.5, 0.5, 0.5)

    const box = new THREE.Box3();
    box.setFromObject(gltf.scene)

    const center = new THREE.Vector3()
    box.getCenter(center)
    gltf.scene.position.x -= center.x
    gltf.scene.position.z -= center.z
    gltf.scene.position.y -= box.min.y
    gltf.scene.position.y -= 6.25

    Object.values(gltf.nodes).filter(node => node.type === 'Mesh').forEach(node => {
      node.receiveShadow = node.castShadow = true
      node.material.envMap = envMap
      node.material.envMapIntensity = 2
      node.material.needsUpdate = true
    })

    setProgress(100);
    setLoaded(true)
    document.body.style.background = '#2f2f2f'
    scene.add(gltf.scene)

    actions.current = { animation: mixer.clipAction(gltf.animations[0], gltf.scene) }
    return () => gltf.animations.forEach(clip => mixer.uncacheClip(clip))
  }, [])

  useEffect(() => void actions.current.animation.play(), [])

  return (
    <></>
  )
}

function Boundaries() {
  const gltf = useLoader(GLTFLoader, 'assets/boundaries.glb')

  return (
    <mesh
      name="boundaries">
      <bufferGeometry attach="geometry" {...gltf.__$[2].geometry} />
      <meshBasicMaterial attach="material" color="hotpink" visible={false} />
    </mesh>
  )
}

function Lights() {
  const { scene } = useThree()

  useEffect(() => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(256, 256, 256);
    light.castShadow = true;
    scene.add(light);

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 1024;
    light.shadow.bias = -0.002;

    const d = 200;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;

    // const helper = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(helper);
  }, [])

  return (
    <></>
  )
}

const Graphics = ({ mobile, activate, setActivate, setStuck, loaded, setLoaded, setProgress, ...props }) => {
  return (
    <Canvas
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0xeeeeee)
        // gl.toneMapping = THREE.ACESFilmicToneMapping
        // gl.outputEncoding = THREE.sRGBEncoding
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
      }}
      camera={{ far: 1000, near: 0.1, fov: 100 }}>

      <Suspense fallback={null}>
        <Model setLoaded={setLoaded} setProgress={setProgress} />
        <Effects />
      </Suspense>

      {loaded &&
        <Suspense fallback={null}>
          <Boundaries />
          <Stacy />
        </Suspense>
      }

      <Lights />
      <ambientLight intensity={0.8} />
      {!mobile && <ControlsPointer activate={activate} setActivate={setActivate} setStuck={setStuck} />}
      {mobile && <ControlsOrbit />}

    </Canvas>
  );
};

export default Graphics;