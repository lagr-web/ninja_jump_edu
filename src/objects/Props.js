import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Props {

  constructor(world, obj = {}) {
    
    const defaults = {
      model: "../../assets/stone.glb",

      scale: [0.4, 0.4, 0.4],
      position: [0.1, 0.55, 3.5],
      rotationY: 0.3,
    };

    const settings = { ...defaults, ...obj };

    const [xScale, yScale, zScale] = settings.scale;
    const [xPos, yPos, zPos] = settings.position;
    const rotationy = settings.rotationY;

    const propLoader = new GLTFLoader();

    propLoader.load(obj.model, (gltf) => {
      this.prop = gltf.scene;
      this.prop.position.set(xPos, yPos, zPos);
      this.prop.rotation.y = rotationy;
      this.prop.scale.set(xScale, yScale, zScale);

      this.prop.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;

          if (n.material) {
            n.material.metalness = 0; // fuldt metal
            n.material.roughness = .2;
            n.material.envMapIntensity = 1; // lidt blank

            n.material.side = THREE.DoubleSide;
            n.material.transparent = false;
          }
        }
      });

      world.scene.add(this.prop);
    });
  }
}

export default Props;
