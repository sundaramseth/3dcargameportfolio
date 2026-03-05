import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import Physics from './Physics'
import Car from './Car'
import CameraController from './CameraController'
import Stats from "stats.js"

export default class World {

    constructor(canvas) {

        this.canvas = canvas
        this.stats = new Stats()

        this.stats.showPanel(0) // 0 = FPS
        document.body.appendChild(this.stats.dom)

        this.stats.dom.style.position = "absolute"
        this.stats.dom.style.top = "0px"
        this.stats.dom.style.left = "0px"

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xa0d8f0)

        // CAMERA
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )

        this.camera.position.set(0, 4, 10)

        // RENDERER
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })

        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    

        // CONTROLS (for orbit mode)
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enabled = false

        // LIGHTS
        const light = new THREE.DirectionalLight(0xffffff, 2)
        light.position.set(5, 10, 5)
        this.scene.add(light)

        const ambient = new THREE.AmbientLight(0xffffff, 0.4)
        this.scene.add(ambient)

        this.scene.background = new THREE.Color(0x87CEEB)
        // DEBUG AXIS
      //  this.scene.add(new THREE.AxesHelper(5))

       const sunLight = new THREE.DirectionalLight(0xffffff, 1.2)
       sunLight.position.set(50, 50, 25)
       sunLight.shadow.mapSize.width = 2048
       sunLight.shadow.mapSize.height = 2048
       sunLight.castShadow = true
       this.scene.add(sunLight)

        //this.ground.receiveShadow = true
       // this.sunLight.castShadow = true

        // PHYSICS
        this.physics = new Physics(this.scene)

        this.physics.ready.then(() => {

            console.log("Physics Ready ✅")

            this.car = new Car(this.scene, this.physics)

           // this.car.castShadow = true
       

            this.cameraController = new CameraController(
                this.camera,
                this.car,
                this.controls
            )

        })

        // RESIZE
        window.addEventListener('resize', this.onResize)

        this.animate()
    }

    onResize = () => {

        this.camera.aspect =
            window.innerWidth / window.innerHeight

        this.camera.updateProjectionMatrix()

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        )
    }

    animate = () => {

        //this.stats.begin()
        this.stats.begin()

        requestAnimationFrame(this.animate)

        if (this.physics)
            this.physics.update()

        if (this.car)
            this.car.update()

        if (
            this.car &&
            this.cameraController &&
            this.car.body
        ) {

            const pos = this.car.body.translation()
            const quat = this.car.body.rotation()

            this.cameraController.update(pos, quat)
        }

        this.renderer.render(this.scene, this.camera)

        this.stats.end()
    }
}