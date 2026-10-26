import type { StaticImageData } from "next/image";
import dsc00465 from "@/public/assets/DSC00465.webp";
import dsc00483 from "@/public/assets/DSC00483-web.webp";
import dsc00535 from "@/public/assets/DSC00535.webp";
import dsc00645 from "@/public/assets/DSC00645.webp";
import dsc00911 from "@/public/assets/DSC00911.webp";
import dsc00929 from "@/public/assets/DSC00929.webp";
import dsc04499 from "@/public/assets/DSC04499.webp";
import dsc04861 from "@/public/assets/DSC04861.webp";
import dsc04938 from "@/public/assets/DSC04938.webp";
import dsc05383 from "@/public/assets/DSC05383.webp";
import dsc05480 from "@/public/assets/DSC05480.webp";
import dsc09908 from "@/public/assets/DSC09908.webp";
import earthCoastalBluffs from "@/public/assets/earth/coastal-bluffs.webp";
import earthCurvingShore from "@/public/assets/earth/curving-shore.webp";
import earthDistantTower from "@/public/assets/earth/distant-tower.webp";
import earthEveningOverTheCove from "@/public/assets/earth/evening-over-the-cove.webp";
import earthGlacierFlow from "@/public/assets/earth/glacier-flow.webp";
import earthGoldenGate from "@/public/assets/earth/golden-gate.webp";
import earthHighAlpineRidges from "@/public/assets/earth/high-alpine-ridges.webp";
import earthLookingUp from "@/public/assets/earth/looking-up.webp";
import earthLowTide from "@/public/assets/earth/low-tide.webp";
import earthMachuPicchu from "@/public/assets/earth/machu-picchu.webp";
import earthMineralRidges from "@/public/assets/earth/mineral-ridges.webp";
import earthOneBranch from "@/public/assets/earth/one-branch.webp";
import earthPalmFronds from "@/public/assets/earth/palm-fronds.webp";
import earthPalmsAtDusk from "@/public/assets/earth/palms-at-dusk.webp";
import earthPalmsInTheBreeze from "@/public/assets/earth/palms-in-the-breeze.webp";
import earthPeritoMoreno from "@/public/assets/earth/perito-moreno.webp";
import earthScallopedShore from "@/public/assets/earth/scalloped-shore.webp";
import earthStormClouds from "@/public/assets/earth/storm-clouds.webp";
import earthStraightDesertRoad from "@/public/assets/earth/straight-desert-road.webp";
import earthSugarloaf from "@/public/assets/earth/sugarloaf.webp";
import earthTheCliffEdge from "@/public/assets/earth/the-cliff-edge.webp";
import earthTheQuiraing from "@/public/assets/earth/the-quiraing.webp";
import earthThroughTheMist from "@/public/assets/earth/through-the-mist.webp";
import earthTideLines from "@/public/assets/earth/tide-lines.webp";
import earthWhiteFrangipani from "@/public/assets/earth/white-frangipani.webp";
import mapArchesNationalPark from "@/public/assets/maps/arches-national-park.webp";
import mapBahia from "@/public/assets/maps/bahia.webp";
import mapBali from "@/public/assets/maps/bali.webp";
import mapBali2 from "@/public/assets/maps/bali-2.webp";
import mapBenidorm from "@/public/assets/maps/benidorm.webp";
import mapBoblingen from "@/public/assets/maps/boblingen.webp";
import mapBromo from "@/public/assets/maps/bromo.webp";
import mapForrestGumpPoint from "@/public/assets/maps/forrest-gump-point.webp";
import mapGlaciarPeritoMoreno from "@/public/assets/maps/glaciar-perito-moreno.webp";
import mapHalfMoonBay from "@/public/assets/maps/half-moon-bay.webp";
import mapIguazuFalls from "@/public/assets/maps/iguazu-falls.webp";
import mapKohPhangan from "@/public/assets/maps/koh-phangan.webp";
import mapKohSamui from "@/public/assets/maps/koh-samui.webp";
import mapLechtalAlps from "@/public/assets/maps/lechtal-alps.webp";
import mapMachuPicchu from "@/public/assets/maps/machu-picchu.webp";
import mapPraiaDoNorte from "@/public/assets/maps/praia-do-norte.webp";
import mapRainbowMountain from "@/public/assets/maps/rainbow-mountain.webp";
import mapRioDeJaneiro from "@/public/assets/maps/rio-de-janeiro.webp";
import mapSagres from "@/public/assets/maps/sagres.webp";
import mapSanDiego from "@/public/assets/maps/san-diego.webp";
import mapSanFrancisco from "@/public/assets/maps/san-francisco.webp";
import mapTaipei from "@/public/assets/maps/taipei.webp";
import mapTheQuiraing from "@/public/assets/maps/the-quiraing.webp";
import mapTorresDelPaineNationalPark from "@/public/assets/maps/torres-del-paine-national-park.webp";
import mapUluwatu from "@/public/assets/maps/uluwatu.webp";
import mapVilaNovaDeMilfontes from "@/public/assets/maps/vila-nova-de-milfontes.webp";
import photo6554107 from "@/public/assets/Photo_6554107.webp";

/** What a photo's metadata can say about how it was taken. Every field is
 * optional: a value goes in only when it comes from the photo itself, and the
 * Photos app shows what is there and leaves the rest out. */
export interface PhotoExif {
  /** "Sony ILCE-6000" */
  camera?: string;
  /** "E 35mm F1.8 OSS" */
  lens?: string;
  iso?: number;
  /** Millimetres. */
  focalLength?: number;
  /** "+0.3" */
  exposureBias?: string;
  aperture?: number;
  /** "1/250" */
  shutter?: string;
  /** ISO 8601. thebeautyof.earth records the local wall-clock time where
   * the photo was taken, without its offset, so that is what's here. */
  taken?: string;
}

/** What I wrote about a photo where I published it, on thebeautyof.earth:
 * its title, a line about it, where it was taken and a map of the spot. */
export interface PhotoAbout {
  title: string;
  description: string;
  place: string;
  pin: { lat: number; lng: number };
  /** A dark snapshot of OpenStreetMap around the pin, made once and kept
   * with the site rather than loaded from a tile server per visit. */
  map: StaticImageData;
  /** The photo's own page on thebeautyof.earth. */
  href: string;
}

export interface LibraryPhoto {
  image: StaticImageData;
  /** The file under public/assets. */
  file: string;
  exif?: PhotoExif;
  about?: PhotoAbout;
}

/** My photographer page on thebeautyof.earth, where these were published. */
/** My photographer page on thebeautyof.earth, where these were published. */
export const BEAUTY_OF_EARTH = "https://thebeautyof.earth/by/jo-maendle";
/** A photo's own page there, followed by its id. */
const BEAUTY_OF_EARTH_PHOTO = "https://thebeautyof.earth/photo/";

/**
 * My photographs: everything I published on thebeautyof.earth (with what I
 * wrote about each one there, where it was taken, and the camera data the
 * site holds for it), then the prints the homepage pile was laid out for.
 * Static imports carry each image's dimensions (for orientation) and a
 * build-time blur placeholder. Ordered as Photos orders a library: by when
 * each was taken, oldest first, with the undated ones after.
 */
export const PHOTO_LIBRARY: LibraryPhoto[] = [
  {
    image: earthPalmsAtDusk,
    file: "earth/palms-at-dusk.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 50,
      aperture: 5.6,
      shutter: "1/80",
      taken: "2018-09-04T03:47:21",
    },
    about: {
      title: "Palms at Dusk",
      description:
        "Tall palm trees stand in silhouette against an orange and grey sunset sky in San Diego, California.",
      place: "San Diego, California",
      pin: { lat: 32.7138, lng: -117.1567 },
      map: mapSanDiego,
      href: `${BEAUTY_OF_EARTH_PHOTO}ImR5LhcIZ18O`,
    },
  },
  {
    image: earthPalmsInTheBreeze,
    file: "earth/palms-in-the-breeze.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 16,
      aperture: 9.5,
      shutter: "1/90",
      taken: "2019-02-01T09:02:01",
    },
    about: {
      title: "Palms in the Breeze",
      description:
        "A leaning coconut palm frames a view of pale turquoise water and distant boats on Koh Phangan, Thailand.",
      place: "Koh Phangan, Thailand",
      pin: { lat: 9.753, lng: 100.0329 },
      map: mapKohPhangan,
      href: `${BEAUTY_OF_EARTH_PHOTO}14`,
    },
  },
  {
    image: earthWhiteFrangipani,
    file: "earth/white-frangipani.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 50,
      aperture: 6.7,
      shutter: "1/250",
      taken: "2019-02-04T11:06:44",
    },
    about: {
      title: "White Frangipani",
      description:
        "Clusters of white frangipani flowers with yellow centres on a tree against a clear blue sky in Koh Samui, Thailand.",
      place: "Koh Samui, Thailand",
      pin: { lat: 9.5104, lng: 100.0167 },
      map: mapKohSamui,
      href: `${BEAUTY_OF_EARTH_PHOTO}9`,
    },
  },
  {
    image: earthGlacierFlow,
    file: "earth/glacier-flow.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 16,
      aperture: 10,
      shutter: "1/100",
      taken: "2019-10-11T15:07:45",
    },
    about: {
      title: "Glacier Flow",
      description:
        "A wide glacier of blue-white ice meets a rocky outcrop and a milky lake under low cloud in Torres del Paine National Park, Chile.",
      place: "Torres del Paine National Park, Chile",
      pin: { lat: -50.9459, lng: -73.4128 },
      map: mapTorresDelPaineNationalPark,
      href: `${BEAUTY_OF_EARTH_PHOTO}aAewyCdbMOf6`,
    },
  },
  {
    image: earthPeritoMoreno,
    file: "earth/perito-moreno.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 18,
      aperture: 11,
      shutter: "1/320",
      taken: "2019-10-17T17:38:13",
    },
    about: {
      title: "Perito Moreno",
      description:
        "The jagged blue face of Perito Moreno Glacier meets a turquoise lake below snow-streaked mountains in Argentine Patagonia.",
      place: "Glaciar Perito Moreno, Argentina",
      pin: { lat: -50.4968, lng: -73.1338 },
      map: mapGlaciarPeritoMoreno,
      href: `${BEAUTY_OF_EARTH_PHOTO}-maJXk5ZP3nQ`,
    },
  },
  {
    image: earthThroughTheMist,
    file: "earth/through-the-mist.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 16,
      aperture: 8,
      shutter: "1/100",
      taken: "2019-11-14T15:18:10",
    },
    about: {
      title: "Through the Mist",
      description:
        "Multiple cascades of Iguazu Falls pour into a mist-filled gorge, with green jungle lining the cliffs above.",
      place: "Iguazu Falls, Brazil",
      pin: { lat: -25.6854, lng: -54.4431 },
      map: mapIguazuFalls,
      href: `${BEAUTY_OF_EARTH_PHOTO}qIDJrB27r1Qf`,
    },
  },
  {
    image: earthMineralRidges,
    file: "earth/mineral-ridges.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 16,
      aperture: 11,
      shutter: "1/160",
      taken: "2020-01-19T20:05:45",
    },
    about: {
      title: "Mineral Ridges",
      description:
        "Striped mineral bands of red, gold, and turquoise run down the ridges of Rainbow Mountain in Peru, with a line of small figures walking the trail below and clouds massed over the surrounding peaks.",
      place: "Rainbow Mountain, Peru",
      pin: { lat: -13.8726, lng: -71.3051 },
      map: mapRainbowMountain,
      href: `${BEAUTY_OF_EARTH_PHOTO}meAvp37PatYY`,
    },
  },
  {
    image: earthMachuPicchu,
    file: "earth/machu-picchu.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 22,
      aperture: 8,
      shutter: "1/80",
      taken: "2020-01-23T15:26:32",
    },
    about: {
      title: "Machu Picchu",
      description:
        "Terraced stone ruins of Machu Picchu spread along a ridge, with Huayna Picchu and cloud-wrapped green mountains rising behind.",
      place: "Machu Picchu, Peru",
      pin: { lat: -13.163, lng: -72.548 },
      map: mapMachuPicchu,
      href: `${BEAUTY_OF_EARTH_PHOTO}G6n1cUoBwg2b`,
    },
  },
  {
    image: earthCoastalBluffs,
    file: "earth/coastal-bluffs.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 39,
      aperture: 11,
      shutter: "1/320",
      taken: "2022-04-03T01:03:51",
    },
    about: {
      title: "Coastal Bluffs",
      description:
        "A wide sandy beach curves beneath eroded cliffs at Half Moon Bay, California, with waves rolling in and a hillside town visible in the distance.",
      place: "Half Moon Bay, California",
      pin: { lat: 37.4659, lng: -122.4482 },
      map: mapHalfMoonBay,
      href: `${BEAUTY_OF_EARTH_PHOTO}d5i_x6ExBPz4`,
    },
  },
  {
    image: earthStraightDesertRoad,
    file: "earth/straight-desert-road.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 24,
      aperture: 11,
      shutter: "1/125",
      taken: "2022-04-16T20:45:34",
    },
    about: {
      title: "Straight Desert Road",
      description:
        "A straight two-lane highway runs to a vanishing point toward the distant buttes and mesas of Monument Valley, seen from Forrest Gump Point, Utah, under a blue sky with scattered clouds.",
      place: "Forrest Gump Point, Utah",
      pin: { lat: 37.0976, lng: -109.9922 },
      map: mapForrestGumpPoint,
      href: `${BEAUTY_OF_EARTH_PHOTO}aUej3CcLAwbB`,
    },
  },
  {
    image: earthCurvingShore,
    file: "earth/curving-shore.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 16,
      aperture: 11,
      shutter: "1/125",
      taken: "2023-04-01T15:03:47",
    },
    about: {
      title: "Curving Shore",
      description:
        "A wide sandy beach curves toward a palm-lined shore in Bahia, Brazil, with small waves breaking under a mostly blue sky and a large white cloud on the horizon.",
      place: "Bahia, Brazil",
      pin: { lat: -13.9625, lng: -38.9278 },
      map: mapBahia,
      href: `${BEAUTY_OF_EARTH_PHOTO}mO6slOnuL1Cv`,
    },
  },
  {
    image: earthHighAlpineRidges,
    file: "earth/high-alpine-ridges.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E 18-135mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 18,
      aperture: 11,
      shutter: "1/125",
      taken: "2024-08-15T08:36:08",
    },
    about: {
      title: "High Alpine Ridges",
      description:
        "Green and grey mountain ridges of the Lechtal Alps in Austria, with patches of old snow on a distant peak and hazy summits fading into the background under a clear sky.",
      place: "Lechtal Alps, Austria",
      pin: { lat: 47.2485, lng: 10.4532 },
      map: mapLechtalAlps,
      href: `${BEAUTY_OF_EARTH_PHOTO}26B7YPv31DcT`,
    },
  },
  {
    image: earthEveningOverTheCove,
    file: "earth/evening-over-the-cove.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 16,
      aperture: 5.6,
      shutter: "1/60",
      taken: "2024-12-18T17:56:43",
    },
    about: {
      title: "Evening over the Cove",
      description:
        "A rocky cove near Benidorm, Spain, with a small island offshore as the sun sets low over the sea.",
      place: "Benidorm, Spain",
      pin: { lat: 38.5259, lng: -0.1091 },
      map: mapBenidorm,
      href: `${BEAUTY_OF_EARTH_PHOTO}1FhVjIqXO4GV`,
    },
  },
  {
    image: earthDistantTower,
    file: "earth/distant-tower.webp",
    exif: {
      camera: "Sony ILCE-6000",
      lens: "E PZ 16-50mm F3.5-5.6 OSS",
      iso: 100,
      focalLength: 50,
      aperture: 6.7,
      shutter: "1/90",
      taken: "2026-05-20T09:15:30",
    },
    about: {
      title: "Distant Tower",
      description:
        "A hazy view over Taipei's skyline, with Taipei 101 rising above the city and mountains behind, framed by green foliage in the foreground.",
      place: "Taipei, Taiwan",
      pin: { lat: 25.0782, lng: 121.5306 },
      map: mapTaipei,
      href: `${BEAUTY_OF_EARTH_PHOTO}hnbSFpi3sFiB`,
    },
  },
  {
    image: earthTideLines,
    file: "earth/tide-lines.webp",
    about: {
      title: "Tide Lines",
      description:
        "An aerial view of a wave breaking, white foam streaking across the teal ocean surface off Bali, Indonesia.",
      place: "Bali, Indonesia",
      pin: { lat: -8.8241, lng: 115.0896 },
      map: mapBali2,
      href: `${BEAUTY_OF_EARTH_PHOTO}1`,
    },
  },
  {
    image: earthTheQuiraing,
    file: "earth/the-quiraing.webp",
    about: {
      title: "The Quiraing",
      description:
        "An aerial view of the jagged green peaks of the Quiraing on the Isle of Skye, with a narrow road winding through the hills below a heavy, rain-laden sky.",
      place: "The Quiraing, Isle of Skye, Scotland",
      pin: { lat: 57.624, lng: -6.265 },
      map: mapTheQuiraing,
      href: `${BEAUTY_OF_EARTH_PHOTO}lMdB3obo91Dq`,
    },
  },
  {
    image: earthScallopedShore,
    file: "earth/scalloped-shore.webp",
    about: {
      title: "Scalloped Shore",
      description:
        "An elevated view of Praia do Norte in Nazaré, Portugal, where white waves fold onto a wide stretch of pale sand and two small figures walk near the water's edge.",
      place: "Praia do Norte, Nazaré, Portugal",
      pin: { lat: 39.6128, lng: -9.0714 },
      map: mapPraiaDoNorte,
      href: `${BEAUTY_OF_EARTH_PHOTO}iRyViqwhaauX`,
    },
  },
  {
    image: earthLookingUp,
    file: "earth/looking-up.webp",
    about: {
      title: "Looking Up",
      description:
        "Cherry blossom branches in full pink bloom against a clear blue sky in Böblingen, Germany.",
      place: "Böblingen, Germany",
      pin: { lat: 48.6858, lng: 9.0136 },
      map: mapBoblingen,
      href: `${BEAUTY_OF_EARTH_PHOTO}13`,
    },
  },
  {
    image: earthLowTide,
    file: "earth/low-tide.webp",
    about: {
      title: "Low Tide",
      description:
        "The sun sets over the Atlantic at Vila Nova de Milfontes, Portugal, its light spreading orange across the sky and reflecting on wet rock pools and exposed reef in the foreground, with birds gathered along the shoreline.",
      place: "Vila Nova de Milfontes, Portugal",
      pin: { lat: 37.7174, lng: -8.7891 },
      map: mapVilaNovaDeMilfontes,
      href: `${BEAUTY_OF_EARTH_PHOTO}2`,
    },
  },
  {
    image: dsc00483,
    file: "DSC00483-web.webp",
    about: {
      title: "Pink Frangipani",
      description:
        "A cluster of pink frangipani flowers with green leaves against a clear blue sky in Bali, Indonesia.",
      place: "Bali, Indonesia",
      pin: { lat: -8.5097, lng: 115.2618 },
      map: mapBali,
      href: `${BEAUTY_OF_EARTH_PHOTO}3`,
    },
  },
  {
    image: dsc09908,
    file: "DSC09908.webp",
    about: {
      title: "Batok at Sunrise",
      description:
        "Sunrise light rakes the volcanic cones of the Tengger caldera at Bromo, Java, with the conical peak of Mount Semeru rising in the distance.",
      place: "Bromo, Java, Indonesia",
      pin: { lat: -7.9258, lng: 112.9438 },
      map: mapBromo,
      href: `${BEAUTY_OF_EARTH_PHOTO}4`,
    },
  },
  {
    image: earthOneBranch,
    file: "earth/one-branch.webp",
    about: {
      title: "One Branch",
      description:
        "Pale pink cherry blossoms open along a dark branch, photographed close up in Böblingen, Germany, with more blossoms and buds blurred behind.",
      place: "Böblingen, Germany",
      pin: { lat: 48.6858, lng: 9.0136 },
      map: mapBoblingen,
      href: `${BEAUTY_OF_EARTH_PHOTO}5`,
    },
  },
  {
    image: earthTheCliffEdge,
    file: "earth/the-cliff-edge.webp",
    about: {
      title: "The Cliff Edge",
      description:
        "An aerial view of waves breaking against a rocky cliff base and a small pocket beach at Uluwatu, Bali, with two surfers waiting beyond the break.",
      place: "Uluwatu, Bali, Indonesia",
      pin: { lat: -8.8331, lng: 115.088 },
      map: mapUluwatu,
      href: `${BEAUTY_OF_EARTH_PHOTO}6`,
    },
  },
  {
    image: dsc05383,
    file: "DSC05383.webp",
    about: {
      title: "Last Light",
      description:
        "A lone figure stands on the wet sand as the sun sets low over the ocean at Sagres, Portugal, its light forming a bright path across rows of incoming waves.",
      place: "Sagres, Portugal",
      pin: { lat: 37.0257, lng: -9.0008 },
      map: mapSagres,
      href: `${BEAUTY_OF_EARTH_PHOTO}7`,
    },
  },
  {
    image: earthPalmFronds,
    file: "earth/palm-fronds.webp",
    about: {
      title: "Palm Fronds",
      description:
        "Close view of arching palm fronds in San Diego, California, their green blades shading to yellow and pale cream where sunlight falls across them.",
      place: "San Diego, California",
      pin: { lat: 32.7138, lng: -117.1567 },
      map: mapSanDiego,
      href: `${BEAUTY_OF_EARTH_PHOTO}8`,
    },
  },
  {
    image: earthSugarloaf,
    file: "earth/sugarloaf.webp",
    about: {
      title: "Sugarloaf",
      description:
        "An aerial view over Rio de Janeiro's dense waterfront neighborhoods to Sugarloaf Mountain and Guanabara Bay, with distant hills fading into haze and cloud.",
      place: "Rio de Janeiro, Brazil",
      pin: { lat: -22.9456, lng: -43.1588 },
      map: mapRioDeJaneiro,
      href: `${BEAUTY_OF_EARTH_PHOTO}10`,
    },
  },
  {
    image: earthGoldenGate,
    file: "earth/golden-gate.webp",
    about: {
      title: "Golden Gate",
      description:
        "The Golden Gate Bridge spans the bay under a clear sky, with the San Francisco skyline visible across the water.",
      place: "San Francisco, California",
      pin: { lat: 37.8162, lng: -122.4825 },
      map: mapSanFrancisco,
      href: `${BEAUTY_OF_EARTH_PHOTO}11`,
    },
  },
  {
    image: earthStormClouds,
    file: "earth/storm-clouds.webp",
    about: {
      title: "Storm Clouds",
      description:
        "Dark storm clouds gather over red sandstone rock formations rising above sagebrush in Arches National Park, Utah.",
      place: "Arches National Park, Utah",
      pin: { lat: 38.7325, lng: -109.5925 },
      map: mapArchesNationalPark,
      href: `${BEAUTY_OF_EARTH_PHOTO}12`,
    },
  },
  { image: dsc00465, file: "DSC00465.webp" },
  { image: dsc00645, file: "DSC00645.webp" },
  { image: dsc00929, file: "DSC00929.webp" },
  { image: dsc00535, file: "DSC00535.webp" },
  { image: dsc04861, file: "DSC04861.webp" },
  { image: dsc04938, file: "DSC04938.webp" },
  { image: dsc00911, file: "DSC00911.webp" },
  { image: dsc05480, file: "DSC05480.webp" },
  { image: dsc04499, file: "DSC04499.webp" },
  { image: photo6554107, file: "Photo_6554107.webp" },
];

/** Every photo, for the /iphone Photos app. */
export const PHOTOS: StaticImageData[] = PHOTO_LIBRARY.map((p) => p.image);

/** The homepage pile: the prints it was laid out for, in its order. */
export const PILE_PHOTOS: StaticImageData[] = [
  dsc00483,
  dsc00465,
  dsc00645,
  dsc00929,
  dsc00535,
  dsc04861,
  dsc04938,
  dsc00911,
  dsc05383,
  dsc05480,
  dsc04499,
  dsc09908,
  photo6554107,
];

/** When the prints were added to the site (the commit that brought them in):
 * the date Photos shows for a photo that has no capture date of its own. */
export const PHOTOS_ADDED = "2026-09-13T10:22:02+02:00";

/** The /iphone Photos widget: a surfer against the sunset. */
export const FEATURED_PHOTO = dsc00535;

/** The /iphone wallpaper. Portrait, with open sky where the clock sits. */
export const WALLPAPER = dsc04499;
