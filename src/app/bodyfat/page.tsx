import { getUserProfile } from "@/actions/user.actions";
import { getBodyFatHistory } from "@/actions/bodyfat.actions";
import BodyFatClient from "./bodyfat-client";
import { redirect } from "next/navigation";

export default async function BodyFatPage() {
  const user = await getUserProfile();

  if (!user) {
    redirect("/onboarding");
  }

  const history = await getBodyFatHistory();

  return <BodyFatClient user={user} history={history} />;
}
