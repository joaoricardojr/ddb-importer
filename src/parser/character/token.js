import logger from "../../logger.js";
import DICTIONARY from "../../dictionary.js";
import DDBCharacter from "../DDBCharacter.js";

DDBCharacter.prototype._generateToken = function _generateToken() {
  try {
    // Default to the most basic token setup.
    // everything else can be handled by the user / Token Mold
    let tokenData = {
      actorLink: true,
      name: this.source.ddb.character.name,
      sight: {
        enabled: true,
        range: 0,
        angle: 360,
        color: null,
        attenuation: 0,
        brightness: 0,
        saturation: 0,
        contrast: 0,
        visionMode: "basic",
      },
      detectionModes: [],
    };
    const senses = this.getSenses();
    // darkvision: 0,
    // blindsight: 0,
    // tremorsense: 0,
    // truesight: 0,

    for (const [key, value] of Object.entries(senses)) {
      if (value > 0 && value > tokenData.sight.range && hasProperty(DICTIONARY.senseMap, key)) {
        const visionMode = DICTIONARY.senseMap[key];
        setProperty(tokenData, "sight.visionMode", visionMode);
        setProperty(tokenData, "sight.range", value);
        tokenData.sight = mergeObject(tokenData.sight, CONFIG.Canvas.visionModes[visionMode].vision.defaults);
      }
      if (value > 0 && hasProperty(DICTIONARY.detectionMap, key)) {
        const detectionMode = {
          id: DICTIONARY.detectionMap[key],
          range: value,
          enabled: true,
        };

        // only add duplicate modes if they don't exist
        if (!tokenData.detectionModes.some((mode) => mode.id === detectionMode.id)) {
          tokenData.detectionModes.push(detectionMode);
        }
      }
    }

    // devilsight? we set the vision mode back to basic
    const devilSight = senses.special.includes("You can see normally in darkness");
    if (devilSight) {
      setProperty(tokenData, "sight.visionMode", "basic");
      tokenData.sight = mergeObject(tokenData.sight, CONFIG.Canvas.visionModes.basic.vision.defaults);
    }

    this.raw.character.prototypeToken = tokenData;
  } catch (err) {
    logger.error(err);
    logger.error(err.stack);
    throw new Error("Please update your D&D 5e system to a newer version");
  }
};
