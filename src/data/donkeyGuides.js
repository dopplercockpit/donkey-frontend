import mainDonkey         from "../assets/guides/main_donkey.png";
import pirateDonkey       from "../assets/guides/pirate_donkey.png";
import corporateDonkey    from "../assets/guides/corporate_donkey.png";
import groovyDonkey       from "../assets/guides/groovy_donkey.png";
import drillSergeantDonkey from "../assets/guides/drill_sergeant_donkey.png";
import fluidDonkey        from "../assets/guides/fluid_donkey.png";
import detectiveDonkey    from "../assets/guides/detective_donkey.png";
import dramaDonkey        from "../assets/guides/drama_donkey.png";

// toneId maps to the backend TONE_PRESETS key used in /prompt/stream requests.
export const DONKEY_GUIDES = [
  {
    id: "default",
    toneId: "sarcastic",
    title: "Mister Donkey",
    image: mainDonkey,
    description: "Blunt forecasts. No meteorological foreplay.",
    promptStyle:
      "Use the default Mister Donkey voice: blunt, sharp, funny, practical, a little rude, but still useful.",
  },
  {
    id: "pirate",
    toneId: "pirate",
    title: "Pirate Donkey",
    image: pirateDonkey,
    description: "Yarrr. Weather off the high seas and low standards.",
    promptStyle:
      "Use a pirate voice: nautical, salty, dramatic, funny, and weather-focused. Do not make it unreadable.",
  },
  {
    id: "corporate",
    toneId: "professional",
    title: "Corporate Donkey",
    image: corporateDonkey,
    description: "Boardroom forecasts with none of the spreadsheet cosplay.",
    promptStyle:
      "Use a corporate boardroom voice: polished, executive, dryly sarcastic, anti-buzzword, and practical.",
  },
  {
    id: "groovy",
    toneId: "hippie",
    title: "Groovy Donkey",
    image: groovyDonkey,
    description: "Cosmic vibes. Questionable pants. Accurate weather.",
    promptStyle:
      "Use a groovy psychedelic voice: cosmic, playful, mellow, funny, and clear about the actual weather.",
  },
  {
    id: "drill_sergeant",
    toneId: "drill_sergeant",
    title: "Drill Sergeant Donkey",
    image: drillSergeantDonkey,
    description: "Weather briefings screamed directly into your weak little umbrella.",
    promptStyle:
      "Use a drill sergeant voice: commanding, intense, funny, tactical, and practical. Keep the forecast clear.",
  },
  {
    id: "fluid",
    toneId: "gen_z",
    title: "Fluid Donkey",
    image: fluidDonkey,
    description: "No cap. This forecast slaps, then complains about humidity.",
    promptStyle:
      "Use a Gen Z / internet slang voice: funny, chaotic, but still understandable. Do not overdo slang to the point of nonsense.",
  },
  {
    id: "detective",
    toneId: "noir_detective",
    title: "Detective Donkey",
    image: detectiveDonkey,
    description: "Moody clues, damp alleys, suspicious barometric pressure.",
    promptStyle:
      "Use a noir detective voice: moody, dry, suspicious, atmospheric, and funny. Keep the actual weather information clear.",
  },
  {
    id: "drama",
    toneId: "shakespeare",
    title: "Drama Donkey",
    image: dramaDonkey,
    description: "Hark. The forecast arrives, emotionally overdressed.",
    promptStyle:
      "Use a theatrical Shakespearean/drama voice: dramatic, poetic, funny, and clear. Do not make it too hard to understand.",
  },
];

export function getDonkeyGuideById(id) {
  return DONKEY_GUIDES.find((guide) => guide.id === id) || DONKEY_GUIDES[0];
}
