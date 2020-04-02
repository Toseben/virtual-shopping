import * as THREE from 'three'
import React, { useRef, useEffect, useState, useMemo } from 'react'
import { extend, useFrame, useThree } from 'react-three-fiber';
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls'

const vec = new THREE.Vector3();
extend({ DeviceOrientationControls })
export default function ControlsDeviceOrientation({ activate, setActivate, setStuck, hoverProduct, setHoverProduct, setSelectProduct }) {
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

  const moveForwardFunction = distance => {
    vec.setFromMatrixColumn(camera.matrix, 0);
    vec.crossVectors(camera.up, vec);
    camera.position.addScaledVector(vec, distance);
  };

  useFrame(() => {
    if (activate) {
      controls.current.update()

      raycaster.ray.origin.copy(controls.current.object.position);
      raycaster.ray.origin.y = 25;

      productRaycaster.ray.origin.copy(controls.current.object.position);
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

      moveForwardFunction(- velocity.current * delta);

      prevTime.current = time;
    }
  })

  const onMouseDown = () => {
    if (hoverProduct) {
      setSelectProduct(hoverProduct)

      setTimeout(() => {
        setActivate(false)
        velocity.current = 0
        gl.render(scene, camera)
      }, 100)
      return
    }

    setMoveForward(true)
  }

  const onMouseUp = () => {
    setMoveForward(false)
  }

  useEffect(() => {
    document.addEventListener('pointerdown', onMouseDown)
    document.addEventListener('pointerup', onMouseUp)
    document.addEventListener('pointerout', onMouseUp)
    return () => {
      document.removeEventListener('pointerdown', onMouseDown)
      document.removeEventListener('pointerup', onMouseUp)
      document.removeEventListener('pointerout', onMouseUp)
    }
  }, [hoverProduct])

  return (
    <deviceOrientationControls ref={controls} args={[camera]} />
  )
}