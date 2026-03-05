import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'

export default class Physics {

    constructor(scene) {

        this.scene = scene
        this.ready = this.init()
    }

    async init() {

        await RAPIER.init()

        this.world = new RAPIER.World({
            x: 0,
            y: -9.81,
            z: 0
        })

        // Ground
        const groundBody = this.world.createRigidBody(
            RAPIER.RigidBodyDesc.fixed()
        )

        const collider = RAPIER.ColliderDesc.cuboid(100, 0.1, 100)
        this.world.createCollider(collider, groundBody)

        // const mesh = new THREE.Mesh(
        //     new THREE.BoxGeometry(100, 0.2, 100),
        //     new THREE.MeshStandardMaterial({ color: 'green' })
        // )



        const roadGeometry = new THREE.PlaneGeometry(20, 200)

        const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333
        })

        const road = new THREE.Mesh(roadGeometry, roadMaterial)

        road.rotation.x = -Math.PI / 2
        road.position.y = 0.01

        const lineGeometry = new THREE.PlaneGeometry(0.5, 200)

        const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
        })

        const line = new THREE.Mesh(lineGeometry, lineMaterial)

        line.rotation.x = -Math.PI / 2
        line.position.y = 0.02
        
        this.scene.add(line)


        this.scene.add(road)
for (let i = -80; i < 80; i += 10) {

  this.createTree(-6, i)
  this.createTree(6, i)

}


const groundGeometry = new THREE.PlaneGeometry(500, 500)

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x3a9d23
})

const ground = new THREE.Mesh(groundGeometry, groundMaterial)

ground.rotation.x = -Math.PI / 2

this.scene.add(ground)
        

       // this.scene.add(mesh)
    }

    update() {
        if (this.world)
            this.world.step()

        
    }

createTree(x, z) {

  const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2)
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })

  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)

  const leavesGeometry = new THREE.SphereGeometry(1.2)
  const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 })

  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial)

  leaves.position.y = 2

  const tree = new THREE.Group()
  tree.add(trunk)
  tree.add(leaves)

  tree.position.set(x, 1, z)

  this.scene.add(tree)
  
}


    

}
