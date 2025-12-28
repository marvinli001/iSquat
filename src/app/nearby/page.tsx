import NearbyClient from "./NearbyClient";
import { getToilets } from "@/lib/toiletData";

export default async function NearbyPage() {
  const toilets = await getToilets();

  return <NearbyClient toilets={toilets} />;
}
