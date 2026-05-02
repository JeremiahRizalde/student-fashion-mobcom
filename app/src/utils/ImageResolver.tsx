
const STARTING_ASSETS: { [key: string]: any } = {
  // TOPS
  "shuffle_hoodie.png": require("../../../assets/images/shuffle_hoodie.png"),
  "shuffle_tshirt.png": require("../../../assets/images/shuffle_tshirt.png"),
  "shuffle_raincoat.png": require("../../../assets/images/shuffle_raincoat.png"),
  "shuffle_sweater.png": require("../../../assets/images/shuffle_sweater.png"),
  "shuffle_tanktop.png": require("../../../assets/images/shuffle_tanktop.png"),
  "shuffle_denim_jacket.png": require("../../../assets/images/shuffle_denim_jacket.png"),
  "shuffle_polo.png": require("../../../assets/images/shuffle_polo.png"),
  "shuffle_longsleeve.png": require("../../../assets/images/shuffle_longsleeve.png"),
  "shuffle_windbreaker.png": require("../../../assets/images/shuffle_windbreaker.png"),
  "shuffle_puffer.png": require("../../../assets/images/shuffle_puffer.png"),
  // BOTTOMS
  "shuffle_cargo_pants.png": require("../../../assets/images/shuffle_cargo_pants.png"),
  "shuffle_shorts.png": require("../../../assets/images/shuffle_shorts.png"),
  "shuffle_jeans.png": require("../../../assets/images/shuffle_jeans.png"),
  "shuffle_chinos.png": require("../../../assets/images/shuffle_chinos.png"),
  "shuffle_sweatpants.png": require("../../../assets/images/shuffle_sweatpants.png"),
  "shuffle_basketball_shorts.png": require("../../../assets/images/shuffle_basketball_shorts.png"),
  "shuffle_thermal_pants.png": require("../../../assets/images/shuffle_thermal_pants.png"),
  "shuffle_corduroy.png": require("../../../assets/images/shuffle_corduroy.png"),
  "shuffle_linen_pants.png": require("../../../assets/images/shuffle_linen_pants.png"),
  "shuffle_rain_pants.png": require("../../../assets/images/shuffle_rain_pants.png"),
  // SHOES
  "shuffle_sneakers.png": require("../../../assets/images/shuffle_sneakers.png"),
  "shuffle_sandals.png": require("../../../assets/images/shuffle_sandals.png"),
  "shuffle_rain_boots.png": require("../../../assets/images/shuffle_rain_boots.png"),
  "shuffle_loafers.png": require("../../../assets/images/shuffle_loafers.png"),
  "shuffle_running_shoes.png": require("../../../assets/images/shuffle_running_shoes.png"),
  "shuffle_hiking_boots.png": require("../../../assets/images/shuffle_hiking_boots.png"),
  "shuffle_flipflops.png": require("../../../assets/images/shuffle_flipflops.png"),
  "shuffle_boots.png": require("../../../assets/images/shuffle_boots.png"),
  "shuffle_dress_shoes.png": require("../../../assets/images/shuffle_dress_shoes.png"),
  "shuffle_winter_boots.png": require("../../../assets/images/shuffle_winter_boots.png"),

  // OUTFITS
  "Opanchrome.png": require("../../../assets/images/Opanchrome.png"),
  "Street Style.png": require("../../../assets/images/Street Style.png"),
  "Minimalist.png": require("../../../assets/images/Minimalist.png"),
  "Gorpcore.png": require("../../../assets/images/Gorpcore.png"),
  "Y2K Revival.png": require("../../../assets/images/Y2K Revival.png"),
};

const PLACEHOLDER = require("../../../assets/images/SFA-icon.png");

export const resolveClothingImage = (imagePointer: any) => {
  if (!imagePointer) return require("../../../assets/images/SFA-icon.png");

  if (typeof imagePointer === 'string') {
    if (imagePointer.startsWith('file://')) {
      return { uri: imagePointer };
    }
    const fileName = imagePointer.split('/').pop() || "";
    return STARTING_ASSETS[fileName] || require("../../../assets/images/SFA-icon.png");
  }

  return imagePointer;
};