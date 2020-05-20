import { join } from "https://deno.land/std/path/mod.ts";
import { parse } from "https://deno.land/std/encoding/csv.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";

export async function loadPlanetData() {
  const path = join(".", "kepler_exoplanets_nasa.csv");

  const file = await Deno.open(path);
  const bufReader = new BufReader(file);
  
  const result = await parse(bufReader, {
    header: true,
    comment: "#",
  });

  // Close file resource id (rid) to avoid leaking resources.
  Deno.close(file.rid);

  const matches = result.filter((item : any) => {
    return item["koi_disposition"] === "CONFIRMED" 
      && item["koi_prad"] > 0.5 && item["koi_prad"] < 2.5
      && item["koi_steff"] > 5200 && item["koi_steff"] < 6200
      && item["koi_srad"] > 0.99 && item["koi_srad"] < 1.01
      && item["koi_smass"] > 0.99 && item["koi_smass"] < 1.01;
  });
  
  return matches.map((item : any) => {
    return {
      keplerName: item["kepler_name"],
      planetaryRadius: item["koi_prad"],
      planetCount: item["koi_count"],
      stellarMass: item["koi_smass"],
      stellarRadius: item["koi_srad"],
      stellarTemperature: item["koi_steff"],
    };
  });
}

if (import.meta.main) {
  const newEarths = await loadPlanetData();
  console.log(`${Object.keys(newEarths).length} Earth-like planets found!`)
  for (const planet of newEarths) {
    console.log(planet);
  }
}
