import { getSession, signOut } from "@/features/auth";
import { WelcomeMessage } from "@/features/home";
import SSEWrapper from "./SSEWrapper";

const HomePage = async () => {
  const session = await getSession();

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <main className="p-8">
      <WelcomeMessage name={session?.user.name ?? ""} signOut={handleSignOut} />
      <SSEWrapper /> {/* This mounts the client-only component */}
    </main>
  );
};

export default HomePage;
