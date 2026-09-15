import Navbar from "@/src/components/navigation/Navbar";
import Footer from "@/src/components/footer/Footer";
import MiwillyChatLazy from "@/src/components/ai/MiwillyChatLazy";

export const revalidate = 60;

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="public-site">{children}</div>
      <Footer />
      <MiwillyChatLazy />
    </>
  );
}
