import { redirect } from "next/navigation";

/** The app's center of gravity is the chat. Send the root there. */
export default function Home() {
  redirect("/chat");
}
