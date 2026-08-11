import Link from "next/link";
import Image from "next/image";
import { getContactSettings, getSocialLinks } from "@/src/lib/data/public";
import { Phone, Mail, MapPin } from "lucide-react";
import FooterClient from "./FooterClient";
import NewsletterForm from "@/src/components/forms/NewsletterForm";

export default async function Footer() {
  const [contact, socialLinks] = await Promise.all([
    getContactSettings(),
    getSocialLinks(),
  ]);

  return (
    <FooterClient
      contact={contact}
      socialLinks={socialLinks}
      newsletter={<NewsletterForm />}
    />
  );
}
