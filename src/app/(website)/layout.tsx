import Navbar from "@/src/components/navigation/Navbar";
import Footer from "@/src/components/footer/Footer";
import MiwillyChat from "@/src/components/ai/MiwillyChat";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
      {/* Stebo Ai assistant — fixed on all public pages */}
      <MiwillyChat />
    </>
  );
}
