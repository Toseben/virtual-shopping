import * as THREE from 'three'
import React, { useRef, Suspense, useEffect, useState, useMemo } from 'react'
import { Canvas, extend, useFrame, useThree, useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { PointerLockControls } from '../libs/PointerLockControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import Environment from './Environment'
import Products from './Products'
import Lights from './Lights'
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
function ControlsPointer({ activate, setActivate, setStuck, hoverProduct, setHoverProduct, setSelectProduct }) {
  const controls = useRef()
  const { scene, camera, gl } = useThree()

  const prevTime = useRef(performance.now())
  const velocity = useRef(0)
  const [moveForward, setMoveForward] = useState(false)

  const raycaster = useMemo(() => new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 14), [])
  const productRaycaster = useMemo(() => new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 30), [])

  const boundaries = scene.children.filter(obj => obj.name === 'boundaries')
  const products = scene.getObjectByName('products')

  const setCurrent = current => {
    if (hoverProduct === current) return
    setHoverProduct(current)
  }

  const handleProductIntersect = () => {
    const lookAt = new THREE.Vector3(0, 0, -1);
    lookAt.applyQuaternion(camera.quaternion).normalize()
    productRaycaster.ray.direction.copy(lookAt)

    const intersections = productRaycaster.intersectObjects(products.children)
    if (!intersections.length) {
      setCurrent(null)
      return
    }

    setCurrent(intersections[0].object.name)
  }

  useFrame(() => {
    if (controls.current.isLocked === true) {
      raycaster.ray.origin.copy(controls.current.getObject().position);
      raycaster.ray.origin.y = 25;

      productRaycaster.ray.origin.copy(controls.current.getObject().position);
      productRaycaster.ray.origin.y = 25;

      handleProductIntersect()

      const lookAt = new THREE.Vector3(0, 0, -1);
      lookAt.applyQuaternion(camera.quaternion);
      lookAt.multiply(new THREE.Vector3(1, 0, 1)).normalize()
      raycaster.ray.direction.copy(lookAt)

      const intersections = boundaries.length ? raycaster.intersectObjects([...boundaries]) : []

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
    if (hoverProduct) {
      setSelectProduct(hoverProduct)
      controls.current.unlock()
      return
    }

    setSelectProduct(null)
    setMoveForward(true)
  }

  const onMouseUp = () => {
    setMoveForward(false)
  }

  const onLock = () => { }

  const onUnlock = () => {
    setActivate(false)
    velocity.current = 0
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
  }, [hoverProduct])

  return (
    <pointerLockControls ref={controls} args={[camera, gl.domElement]} />
  )
}

function Boundaries() {
  const gltf = useLoader(GLTFLoader, 'assets/boundaries_v002.glb')

  return (
    <mesh
      name="boundaries">
      <bufferGeometry attach="geometry" {...gltf.__$[2].geometry} />
      <meshBasicMaterial attach="material" color="hotpink" visible={false} />
    </mesh>
  )
}

const Graphics = ({ 
  hoverProduct, 
  setHoverProduct, 
  selectProduct, 
  setSelectProduct, 
  mobile, 
  activate, 
  setActivate, 
  setStuck, 
  loaded, 
  setLoaded, 
  setProgress, 
  ...props }) => {

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
        <Environment setLoaded={setLoaded} setProgress={setProgress} />
        <Effects />
      </Suspense>

      {loaded &&
        <Suspense fallback={null}>
          <Products hoverProduct={hoverProduct} selectProduct={selectProduct} />
          <Boundaries />
          <Stacy />
        </Suspense>
      }

      <Lights />
      <ambientLight intensity={0.8} />
      {!mobile && <ControlsPointer activate={activate} setActivate={setActivate} setStuck={setStuck}
        hoverProduct={hoverProduct} setHoverProduct={setHoverProduct} setSelectProduct={setSelectProduct} />}
      {mobile && <ControlsOrbit />}

    </Canvas>
  );
};

export default Graphics;