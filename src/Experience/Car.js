import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Car {

    constructor(scene, physics) {

        this.scene = scene
        this.physics = physics

        // movement
        this.speed = 0
        this.maxSpeed = 10
        this.acceleration = 5
        this.turnSpeed = 0.4
        this.steering = 0

        this.keys = {}

        this.model = null
        this.wheels = []
        this.frontWheels = []

        this.createPhysics()
        this.loadModel()
        this.initControls()
    }

    // =============================
    // PHYSICS BODY
    // =============================

    createPhysics() {

        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0, 1, 0)
            .setAngularDamping(4)
            .setLinearDamping(0.5)

        this.body = this.physics.world.createRigidBody(bodyDesc)

        const collider = RAPIER.ColliderDesc.cuboid(0.8, 0.4, 1.6)
        this.physics.world.createCollider(collider, this.body)
    }

    // =============================
    // MODEL LOADING
    // =============================

    loadModel() {

        const loader = new GLTFLoader()

        loader.load('/models/utra_low_poly_car.glb', (gltf) => {

            this.model = gltf.scene
            this.model.scale.set(2, 2, 2)

            // center pivot
            const box = new THREE.Box3().setFromObject(this.model)
            const center = new THREE.Vector3()
            box.getCenter(center)

            this.model.position.sub(center)
            this.model.position.y = 0

            this.scene.add(this.model)

            this.detectWheels()

            console.log("✅ Car Model Loaded")

        }, undefined, (err) => {

            console.error("❌ GLB ERROR", err)

        })
    }

    // =============================
    // WHEEL DETECTION
    // =============================

    detectWheels() {

        if (!this.model) return

        const wheelNames = [
            "Object_12",
            "Object_14",
            "Object_16",
            "Object_18"
        ]

        const frontWheel = [
            "Object_14",
            "Object_16"
        ]

        frontWheel.forEach(name=>{
            const frontWheel = this.model.getObjectByName(name)
            if(frontWheel) this.frontWheels.push(frontWheel)
        })

        wheelNames.forEach(name => {

            const wheel = this.model.getObjectByName(name)

            if (wheel) {

                this.wheels.push(wheel)

                // assume first two are front
                if (this.frontWheels.length < 2)
                    this.frontWheels.push(wheel)

                console.log("Wheel found:", name)
            }
        })
    }

    // =============================
    // INPUT
    // =============================

    initControls() {

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true
        })

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false
        })
    }

    // =============================
    // UPDATE LOOP
    // =============================

    update(delta = 0.016) {

        if (!this.body) return

        this.updateMovement(delta)
        this.updateVisual()
    }

    // =============================
    // MOVEMENT PHYSICS
    // =============================

    updateMovement(delta) {

        // accelerate
        if (this.keys['w']) this.speed += this.acceleration * delta
        if (this.keys['s']) this.speed -= this.acceleration * delta

        // friction
        this.speed *= 0.99

        this.speed = THREE.MathUtils.clamp(
            this.speed,
            -this.maxSpeed,
            this.maxSpeed
        )

        // steering input
        if (this.keys['a']) this.steering = -this.turnSpeed
        else if (this.keys['d']) this.steering = this.turnSpeed
        else this.steering = 0

        // current rotation
        const rot = this.body.rotation()

        const quat = new THREE.Quaternion(
            rot.x,
            rot.y,
            rot.z,
            rot.w
        )

        const euler = new THREE.Euler().setFromQuaternion(quat)

        // turn based on speed
       if (Math.abs(this.speed) > 0.1) {
            const direction = this.speed > 0 ? 1 : -1
            euler.y += this.steering * direction * 0.04
        }

        const newQuat = new THREE.Quaternion().setFromEuler(euler)

        this.body.setRotation({
            x: newQuat.x,
            y: newQuat.y,
            z: newQuat.z,
            w: newQuat.w
        }, true)

        // forward direction (IMPORTANT)
        const forward = new THREE.Vector3(0, 0, 1)
        forward.applyQuaternion(newQuat)
        forward.multiplyScalar(this.speed)

        this.body.setLinvel({
            x: forward.x,
            y: 0,
            z: forward.z
        }, true)
    }

    // =============================
    // VISUAL UPDATE
    // =============================

    updateVisual() {

        const pos = this.body.translation()
        const rot = this.body.rotation()

        const quat = new THREE.Quaternion(
            rot.x,
            rot.y,
            rot.z,
            rot.w
        )

        if (this.model) {

            this.model.position.set(pos.x, pos.y, pos.z)
            this.model.quaternion.copy(quat)

            this.animateWheels()
        }
    }

    // =============================
    // WHEEL ANIMATION
    // =============================

    animateWheels() {

        if (!this.wheels.length) return

        // rolling
        this.wheels.forEach(wheel => {

            wheel.rotation.y -= this.speed * 0.03
        })

        // front steering
        this.frontWheels.forEach(wheel => {

            wheel.rotation.x = this.steering * 0.5
        })
    }

}