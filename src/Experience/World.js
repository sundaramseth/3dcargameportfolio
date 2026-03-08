import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import Physics from './Physics'
import Car from './Car'
import CameraController from './CameraController'
import Stats from "stats.js"

export default class World {

    constructor(canvas) {

        this.mouse = new THREE.Vector2()
        this.raycaster = new THREE.Raycaster()

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
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    

        // CONTROLS (for orbit mode)
        this.controls = new OrbitControls(this.camera, canvas)
        // this.controls.target.set(0, 0, 0);
        
       // this.controls.target = this.car.position
        this.controls.enablePan = true
        this.controls.enableZoom = true
        this.controls.enableRotate = true
        this.controls.minDistance = 5
        this.controls.maxDistance = 15
        this.controls.maxPolarAngle = Math.PI / 2.2
        //this.controls.update();

        // LIGHTS

        
        const ambient = new THREE.AmbientLight(0xffffff, 0.6)
        this.scene.add(ambient)
        
        const light = new THREE.DirectionalLight(0xffffff, 2)
        light.position.set(5, 10, 5)
        light.castShadow = true
        this.scene.add(light)


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

            console.log("Physics Ready")

            this.car = new Car(this.scene, this.physics)

           // this.car.castShadow = true

           if(this.car){
             this.controls.target.copy(this.car.mesh.position)
           }
       
            this.cameraController = new CameraController(
                this.camera,
                this.car,
                this.controls
            )

        })


        //Raycasting for mouse clicks

        window.addEventListener("click", (event) => {

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        this.raycaster.setFromCamera(this.mouse, this.camera)

        const intersects = this.raycaster.intersectObjects(this.scene.children)

        if(intersects.length > 0){
            console.log("Clicked:", intersects[0].object)
        }

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

    this.stats.begin()

    requestAnimationFrame(this.animate)

    if (this.physics)
        this.physics.update()

    if (this.car)
        this.car.update()

if (this.car && this.car.body) {

    const pos = this.car.body.translation()

    this.controls.target.set(
        pos.x,
        pos.y,
        pos.z
    )

    this.controls.update()
}
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