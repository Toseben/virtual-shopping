import * as THREE from 'three'
import React, { useRef, useEffect, useMemo } from 'react'
import { useLoader, useThree, useFrame } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useSpring, a } from 'react-spring/three'

function Product({ index, center, mesh, products, spring }) {
  return (
    <>
      <mesh
        name={products[index]}>
        <bufferGeometry attach="geometry" {...mesh.geometry} />
        <a.meshBasicMaterial side={THREE.DoubleSide} attach="material" color={0xf1c40f} opacity={spring.opacity} transparent depthTest={false} renderOrder={998} />
      </mesh>
      <a.group
        name={`${products[index]}_real`}
        scale={spring.scale.interpolate(s => [s, s, s])}>
        <group>
          <mesh
            renderOrder={999}
            position={center}>
            <bufferGeometry attach="geometry" {...mesh.geometry} />
            <a.meshStandardMaterial
              roughness={0.3}
              metalness={1}
              side={THREE.DoubleSide}
              attach="material"
              color={new THREE.Color(1.000, 0.766, 0.336)}
              opacity={spring.pOpacity}
              transparent
            />
          </mesh>
        </group>
      </a.group>
    </>
  )
}

export default function Products({ hoverProduct, selectProduct }) {
  const { camera } = useThree()
  const gltf = useLoader(GLTFLoader, 'assets/products.glb')

  const [products, meshes] = useMemo(() => {
    const products = gltf.__$.filter(obj => obj.name.includes('product')).map(obj => obj.name)
    const meshes = gltf.__$.filter(obj => obj.name.includes('mesh'))
    return [products, meshes]
  }, [])

  const group = useRef()
  const pointLight = useRef()

  useFrame(({ clock }) => {
    const lookAt = new THREE.Vector3(0, 0, -1);
    lookAt.applyQuaternion(camera.quaternion).normalize().multiplyScalar(2)
    group.current.children.forEach(child => {
      if (!child.name.includes('real')) return
      child.position.copy(camera.position).add(lookAt)
      child.children[0].rotation.y += 0.025
      child.lookAt(camera.position)
    })

    pointLight.current.position.copy(camera.position).add(lookAt.clone().normalize().multiplyScalar(2.5))
    pointLight.current.position.y -= 4
  })

  useEffect(() => {
    if (!selectProduct) return
    group.current.children.forEach(child => {
      if (!child.name.includes('real')) return
      child.children[0].rotation.order = 'YXZ'
      child.children[0].rotation.y = 0
      child.children[0].rotation.x = Math.PI / 12
    })
  }, [selectProduct])

  return (
    <group name="products" ref={group}>
      {meshes.map((mesh, index) => {
        const hoverBoolean = hoverProduct === products[index]
        const selectBoolean = selectProduct === products[index]

        const spring = useSpring({
          opacity: hoverBoolean ? 0.175 : 0,
          pOpacity: selectBoolean ? 1 : 0,
          scale: selectBoolean ? 0.2 : 0,
          config: { mass: 1, friction: 20, tension: 210 }
        })

        const box = new THREE.Box3();
        box.setFromBufferAttribute(mesh.geometry.attributes.position)
        const center = new THREE.Vector3()
        box.getCenter(center)
        center.multiplyScalar(-1)

        return (
          <Product
            key={index}
            index={index}
            center={center}
            mesh={mesh}
            products={products}
            spring={spring}
          />
        )
      })}
      <group ref={pointLight}>
        <pointLight distance={6} intensity={4} color="white" />
        {/* <mesh visible>
          <sphereGeometry attach="geometry" args={[0.1, 16, 16]} />
          <meshStandardMaterial attach="material" color="red" />
        </mesh> */}
      </group>
    </group>
  )
}