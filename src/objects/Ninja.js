//src/objects/ninja.js

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
import { Howl } from "howler";
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

class Ninja {
  
  constructor(world, obj = {}) {

    
    const defaults = {
      model: "/assets/little.glb",  // brug absolut sti
      scale: [0.4, 0.4, 0.4],
      position: [0.1, 0.55, 3.5],
      rotationY: 0.3,
      sound:"",
      animate:false
    };
    const settings = { ...defaults, ...obj };

    console.log(settings.sound);
    
    const [xScale, yScale, zScale] = settings.scale;
    const [xPos, yPos, zPos] = settings.position;
    const rotationy = settings.rotationY;

    this.jumpFinished = true;
    this.ready = false;

    this.jumpNinjaSound = new Howl({
      src: ['../../assets/' + settings.sound ]
    });

    // ✅ Lav loader UI
    const ninjaLoader = document.createElement("div");
    ninjaLoader.id = "loader-container";
    document.body.appendChild(ninjaLoader);

    const loadingText = document.createElement("div");
    loadingText.id = "loader-text";
    loadingText.textContent = "Loading: 0%";
    ninjaLoader.appendChild(loadingText);

    // ✅ LoadingManager
    const manager = new THREE.LoadingManager(
      // onLoad
      () => {
        gsap.to("#loader-container", {
          opacity: 0,
          duration: 0.5,
          onComplete: () => document.getElementById("loader-container").remove(),
        });
            this.ready = true;
      },
      // onProgress
      (url, itemsLoaded, itemsTotal) => {

        console.log(url);

        const percent = (itemsLoaded / itemsTotal) * 100;
        const loaderText = document.getElementById("loader-text");
        if (loaderText) loaderText.innerText = `Loading: ${percent.toFixed(0)}%`;
      },
      // onError
      (url) => {
        console.error(`Fejl under loading af: ${url}`);
      }
    );

    
    const loader = new GLTFLoader(manager);
    loader.setMeshoptDecoder(MeshoptDecoder);

    // Load modellen
    loader.load(settings.model, (gltf) => {

      this.modelAnim = gltf.scene;
      this.modelAnim.position.set(xPos, yPos, zPos);
      this.modelAnim.rotation.y = rotationy;
      this.modelAnim.scale.set(xScale, yScale, zScale);

      this.modelAnim.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          if (n.material) {
            n.material.metalness = 0;
            n.material.roughness = .5;
            n.material.envMapIntensity = 1.5;

             //n.material.emissive.setHex(0xffffff); // Rød farve (brug 0x + hex-kode)
      //n.material.emissiveIntensity = 5;   // Styrke (1 er standard, højere er kraftigere)
          }
        }
      });

      world.scene.add(this.modelAnim);

      world.mixers.push(this);

      // Animation mixer
      this.mixer = new THREE.AnimationMixer(this.modelAnim);
      this.clips = gltf.animations;

      const clip = THREE.AnimationClip.findByName(this.clips, "breath");
      if (clip && settings.animate) {
        const breath = this.mixer.clipAction(clip);
        breath.timeScale = 1.5;
        breath.play();
      }
    });

    world.interactionManager.add(world.scene);
  }

  jump() {

    if (this.jumpFinished && this.ready) {
  this.jumpNinjaSound.play();
     if (this.actionJump) this.actionJump.reset();

        this.jumpNinjaSound.play();

      const clipJump = THREE.AnimationClip.findByName(this.clips, "jump");
      

      this.actionJump = this.mixer.clipAction(clipJump);
      this.actionJump.setLoop(THREE.LoopOnce);
      this.actionJump.play(); 

      gsap.to(this.modelAnim.position, {
        duration: 0.5,
        y: 1.5,
        repeat: 1,
        yoyo: true,
        ease: "Circ.easeInOut",
        onComplete: () => {
          this.jumpFinished = true;
        },
      });

       gsap.to(this.modelAnim.rotation, {
        delay: 0.1,
        duration: 0.5,
        x: this.modelAnim.rotation.x + Math.PI * 2,
        ease: "Circ.easeInOut",
      });
    }

    this.jumpFinished = false;
  }

}

export default Ninja;
