import HomeClient from "./HomeClient";
import { getTopRatedToilets } from "@/lib/toiletData";

export default async function Home() {
  const addMissingHref = "/auth?redirectTo=/dashboard/add";
  const topRatedToilets = await getTopRatedToilets();

  return (
    <HomeClient topRatedToilets={topRatedToilets} addMissingHref={addMissingHref} />
  );
}
