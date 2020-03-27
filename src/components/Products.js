import * as THREE from 'three'
import React, { useRef, useEffect, useMemo } from 'react'
import { useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useSpring, a } from 'react-spring/three'

export default function Products({ hoverProduct }) {
  const gltf = useLoader(GLTFLoader, 'assets/products.glb')

  const [products, meshes] = useMemo(() => {
    const products = gltf.__$.filter(obj => obj.name.includes('product')).map(obj => obj.name)
    const meshes = gltf.__$.filter(obj => obj.name.includes('mesh'))
    return [products, meshes]
  }, [])

  const group = useRef()
  useEffect(() => {
    group.current.children.forEach(child => {
      child.renderOrder = 999;
    })
  }, [])

  return (
    <group name="products" ref={group}>
      {meshes.map((mesh, index) => {
        const boolean = hoverProduct === products[index]
        const { opacity } = useSpring({ opacity: boolean ? 0.175 : 0, config: { mass: 1, friction: 20, tension: 210 } })
        return (
          <mesh key={index}
            name={products[index]}>
            <bufferGeometry attach="geometry" {...mesh.geometry} />
            <a.meshBasicMaterial side={THREE.DoubleSide} attach="material" color={0xf1c40f} opacity={opacity} transparent depthTest={false} />
          </mesh>
        )
      })}
    </group>
  )
}