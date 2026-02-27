import * as THREE from 'three'

export default class CameraController {

    constructor(camera, car, controls = null) {

        this.camera = camera
        this.car = car
        this.controls = controls

        // modes: follow | orbit | first
        this.mode = "follow"

        // OFFSETS
        this.followOffset = new THREE.Vector3(0, 3, -8)
        this.firstOffset = new THREE.Vector3(0, 1.2, 0.4)

        // orbit settings
        this.distance = 10
        this.theta = 0
        this.phi = 0.4

        // smoothing
        this.followLerp = 0.08
        this.orbitLerp = 0.12
        this.firstLerp = 0.2

        this.mouseDown = false

        this.initInput()
    }

    // ================= INPUT =================

    initInput() {

        window.addEventListener("keydown", (e) => {

            if (e.key === "1") this.setMode("follow")
            if (e.key === "2") this.setMode("orbit")
            if (e.key === "3") this.setMode("first")

        })

        window.addEventListener("mousedown", (e) => {
            if (e.button === 2) this.mouseDown = true
        })

        window.addEventListener("mouseup", () => {
            this.mouseDown = false
        })

        window.addEventListener("mousemove", (e) => {

            if (this.mode !== "orbit") return
            if (!this.mouseDown) return

            this.theta -= e.movementX * 0.005
            this.phi -= e.movementY * 0.005

            this.phi = Math.max(0.15, Math.min(Math.PI / 2, this.phi))
        })

        window.addEventListener("wheel", (e) => {

            if (this.mode !== "orbit") return

            this.distance += e.deltaY * 0.01
            this.distance = Math.max(4, Math.min(25, this.distance))
        })

        // disable context menu
        window.addEventListener("contextmenu", e => e.preventDefault())
    }

    setMode(mode) {

        this.mode = mode

        if (this.controls)
            this.controls.enabled = (mode === "orbit")
    }

    // ================= UPDATE =================

    update(pos, quat) {

        if (!pos || !quat || !this.camera) return

        const carPos = new THREE.Vector3(pos.x, pos.y, pos.z)
        const carQuat = new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w)

        switch (this.mode) {

            case "follow":
                this.updateFollow(carPos, carQuat)
                break

            case "orbit":
                this.updateOrbit(carPos)
                break

            case "first":
                this.updateFirst(carPos, carQuat)
                break
        }
    }

    // ================= FOLLOW CAMERA =================

    updateFollow(carPos, carQuat) {

        const offset = this.followOffset.clone().applyQuaternion(carQuat)

        const desiredPos = carPos.clone().add(offset)

        this.camera.position.lerp(desiredPos, this.followLerp)

        this.camera.lookAt(carPos)
    }

    // ================= ORBIT CAMERA =================

    updateOrbit(carPos) {

        const x =
            carPos.x +
            this.distance * Math.sin(this.theta) * Math.cos(this.phi)

        const y =
            carPos.y +
            this.distance * Math.sin(this.phi)

        const z =
            carPos.z +
            this.distance * Math.cos(this.theta) * Math.cos(this.phi)

        const desired = new THREE.Vector3(x, y, z)

        this.camera.position.lerp(desired, this.orbitLerp)

        this.camera.lookAt(carPos)
    }

    // ================= FIRST PERSON =================

    updateFirst(carPos, carQuat) {

        const offset = this.firstOffset.clone().applyQuaternion(carQuat)

        const camPos = carPos.clone().add(offset)

        this.camera.position.lerp(camPos, this.firstLerp)

        this.camera.quaternion.slerp(carQuat, this.firstLerp)
    }
}