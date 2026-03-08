import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";

export default class Physics {
  constructor(scene) {
    this.scene = scene;
    this.ready = this.init();

    this.dummy = new THREE.Object3D();
  }

  async init() {
    await RAPIER.init();

    this.world = new RAPIER.World({
      x: 0,
      y: -9.81,
      z: 0,
    });

    /* PHYSICS GROUND */

    const groundBody = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());

    const collider = RAPIER.ColliderDesc.cuboid(500, 0.1, 500);
    this.world.createCollider(collider, groundBody);

    /* VISUAL GROUND */

    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a9d23,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    this.scene.add(ground);

    /* ROAD */

    const roadGeometry = new THREE.PlaneGeometry(20, 500);

    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
    });

    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01;

    this.scene.add(road);

    /* ROAD LINE */

    const lineGeometry = new THREE.PlaneGeometry(0.5, 500);

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.02;

    this.scene.add(line);

    /* ENVIRONMENT */

    this.initTrees(100);
    this.createGrass(4000);
    this.createBuildings(100);
  }

  /* TREE SYSTEM */

  initTrees(count) {
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    const leavesGeometry = new THREE.SphereGeometry(1.4);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });

    this.trunkMesh = new THREE.InstancedMesh(
      trunkGeometry,
      trunkMaterial,
      count,
    );
    this.leavesMesh = new THREE.InstancedMesh(
      leavesGeometry,
      leavesMaterial,
      count,
    );

    this.trunkMesh.frustumCulled = true;
    this.leavesMesh.frustumCulled = true;

    this.scene.add(this.trunkMesh);
    this.scene.add(this.leavesMesh);

    this.treeIndex = 0;

    for (let i = 0; i < count; i++) {
      const pos = this.getSpawnPosition(12);
      this.createTree(pos.x, pos.z);
    }

    this.trunkMesh.instanceMatrix.needsUpdate = true;
    this.leavesMesh.instanceMatrix.needsUpdate = true;
  }

  createTree(x, z) {
    const dummy = this.dummy;

    const scale = 0.8 + Math.random() * 0.6;

    dummy.position.set(x, 1, z);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.scale.set(scale, scale, scale);

    dummy.updateMatrix();
    this.trunkMesh.setMatrixAt(this.treeIndex, dummy.matrix);

    dummy.position.set(x, 3 * scale, z);
    dummy.updateMatrix();

    this.leavesMesh.setMatrixAt(this.treeIndex, dummy.matrix);

    this.treeIndex++;
  }

  /* GRASS SYSTEM */

  createGrass(count) {
    const grassGeometry = new THREE.PlaneGeometry(0.1, 0.6);

    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x3cb043,
      side: THREE.DoubleSide,
    });

    const grass = new THREE.InstancedMesh(grassGeometry, grassMaterial, count);

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const pos = this.getSpawnPosition(10);

      dummy.position.set(pos.x, 0.3, pos.z);

      dummy.rotation.y = Math.random() * Math.PI;

      const scale = Math.random() * 1.5 + 0.5;
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();

      grass.setMatrixAt(i, dummy.matrix);
    }

    grass.instanceMatrix.needsUpdate = true;

    this.scene.add(grass);
  }

  /* BUILDING SYSTEM */

  createBuildings(count) {

    const textureLoader = new THREE.TextureLoader()

    const buildingTexture = textureLoader.load('./textures/building.jpg')

    buildingTexture.wrapS = THREE.RepeatWrapping
    buildingTexture.wrapT = THREE.RepeatWrapping
    buildingTexture.repeat.set(3, 6)


    const material = new THREE.MeshStandardMaterial({
    map: buildingTexture,
     roughness: 0.8,
     metalness: 0.1
    });

    for (let i = 0; i < count; i++) {
      const pos = this.getSpawnPosition(20);

      const height = Math.random() * 20 + 10;

      const geometry = new THREE.BoxGeometry(4, height, 4);

      const building = new THREE.Mesh(geometry, material);

      building.position.set(pos.x, height / 2, pos.z);

      building.castShadow = true;
      building.receiveShadow = true;

      this.scene.add(building);
    }
  }

  /* SPAWN POSITION */

  getSpawnPosition(minDistanceFromRoad = 10) {
    let x, z;

    do {
      x = (Math.random() - 0.5) * 200;
      z = (Math.random() - 0.5) * 200;
    } while (Math.abs(x) < minDistanceFromRoad);

    return { x, z };
  }

  /* PHYSICS UPDATE */

  update() {
    if (this.world) this.world.step();
  }
}
