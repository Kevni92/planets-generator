import { createBasePlanet } from "../elements/base-planet";
import { createClouds } from "../elements/clouds";
import { createLandmass } from "../elements/landmass";
import { createSpace } from "../elements/space";
import { PLANET_INFO_PROVIDERS, PlanetInfo } from "./planet-types";

export const addNewPlanetAndSpaceToScene = (
  scene: THREE.Scene,
  options?: { type?: string; exportMode?: boolean }
) => {
  const allTypes = Object.keys(PLANET_INFO_PROVIDERS);
  const key =
    options?.type && allTypes.includes(options.type)
      ? options.type
      : allTypes[Math.floor(Math.random() * allTypes.length)];

  const planetInfo: PlanetInfo = PLANET_INFO_PROVIDERS[key as keyof typeof PLANET_INFO_PROVIDERS]();

  return { planetInfo, ...addPlanetAndSpaceToScene(planetInfo, scene, options?.exportMode) };
};


export const addPlanetAndSpaceToScene = (info: PlanetInfo, scene: THREE.Scene, exportMode = false) => {
  const { colorPalette, hasClouds, cloudColor } = info;

  const basePlanet = createBasePlanet(colorPalette)
  const landmass = createLandmass(colorPalette)

  if (!exportMode) {
    const space = createSpace()
    scene.add(space)
  }

  landmass.renderOrder = 1.0
  scene.add(basePlanet)
  scene.add(landmass)

  let clouds: THREE.Mesh | undefined

  if (hasClouds && cloudColor) {
    clouds = createClouds(cloudColor)
    clouds.renderOrder = 2.0
    scene.add(clouds)
  }

  return {
    cleanupSceneFn: () => {
      basePlanet.removeFromParent()
      landmass.removeFromParent()
      clouds?.removeFromParent()
    },
    planetAnimationFn: () => {
      basePlanet.rotation.y += .0004
      landmass.rotation.y += .0004
      if (hasClouds && clouds) {
        clouds.rotation.y += .0002
      }
    }
  }

}
