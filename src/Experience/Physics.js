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

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(100, 0.2, 100),
            new THREE.MeshStandardMaterial({ color: 'green' })
        )

        this.scene.add(mesh)
    }

    update() {
        if (this.world)
            this.world.step()
    }
}