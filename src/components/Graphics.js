import * as THREE from 'three'
import React, { useRef, Suspense, useEffect, useState, useMemo } from 'react'
import { Canvas, extend, useFrame, useThree, useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { PointerLockControls } from '../libs/PointerLockControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

extend({ OrbitControls })
function ControlsOrbit() {
  const controls = useRef()
  const { camera, gl } = useThree()

  useEffect(() => {
    camera.position.set(-125, 125, 125)
  }, [])

  useFrame(() => controls.current.update())
  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
  )
}
extend({ PointerLockControls })
function ControlsPointer({ activate, setActivate }) {
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
        overlay.current.style.opacity = 0.2;
        overlay.current.style.visibility = 'visible';
      } else {
        overlay.current.style.opacity = 0;
        overlay.current.style.visibility = 'hidden';
      }

      controls.current.moveForward(- velocity.current * delta);

      prevTime.current = time;

      storePos.current = camera.position.clone()
      storeRot.current = camera.rotation.clone()
    }

  })

  useEffect(() => {
    camera.position.set(25, 25, 125)
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
    camera.position.copy(storePos.current)
    camera.rotation.copy(storeRot.current)
    gl.render(scene, camera)
  }

  useEffect(() => {
    controls.current.addEventListener('lock', onLock);
    controls.current.addEventListener('unlock', onUnlock);

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseout', onMouseUp)
    return () => {
      controls.current.removeEventListener('lock', onLock);
      controls.current.removeEventListener('unlock', onUnlock);

      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseout', onMouseUp)
    }
  }, [])

  return (
    <pointerLockControls ref={controls} args={[camera, gl.domElement]} />
  )
}

function Model() {
  const { scene } = useThree()

  const actions = useRef()
  const [mixer] = useState(() => new THREE.AnimationMixer())
  useFrame((state, delta) => mixer.update(delta))

  const gltf = useLoader(GLTFLoader, 'assets/LittlestTokyo.glb', loader => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('assets/draco/gltf/');
    loader.setDRACOLoader(dracoLoader)
  })

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

    scene.add(gltf.scene)

    actions.current = { storkFly_B_: mixer.clipAction(gltf.animations[0], gltf.scene) }
    return () => gltf.animations.forEach(clip => mixer.uncacheClip(clip))
  }, [])

  useEffect(() => void actions.current.storkFly_B_.play(), [])

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

const Graphics = ({ mobile, activate, setActivate, ...props }) => {
  return (
    <Canvas
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0xeeeeee)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.outputEncoding = THREE.sRGBEncoding
      }}
      camera={{ far: 1000, near: 0.1, fov: 125 }}>

      <Suspense fallback={null}>
        <Model />
        <Boundaries />
      </Suspense>

      <ambientLight intensity={2} />
      <ControlsPointer activate={activate} setActivate={setActivate} />
      {/* <ControlsOrbit /> */}
    </Canvas>
  );
};

export default Graphics;