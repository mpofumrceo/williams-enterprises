import { getContactSettings, getSocialLinks } from "@/src/lib/data/public";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const [contact, socialLinks] = await Promise.all([
    getContactSettings(),
    getSocialLinks(),
  ]);

  return (
    <NavbarClient
      phone={contact?.phone ?? "+263 71 298 9340"}
      socialLinks={socialLinks}
    />
  );
}
