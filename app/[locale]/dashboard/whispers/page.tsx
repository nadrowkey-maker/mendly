import { listAllWhispers } from "@/lib/actions/whispers";
import { WhispersCenter } from "@/components/dashboard/WhispersCenter";

export default async function WhispersPage() {
  const whispers = await listAllWhispers();
  return <WhispersCenter initial={whispers} />;
}
