import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { rankKnowledge, composeAnswer } from "@/src/lib/ai/retrieval";
import type { AiKnowledge } from "@/src/types/database";
import { consumeRateLimit, clientFingerprint } from "@/src/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const { ipHash } = await clientFingerprint();
    const limit = await consumeRateLimit("ai", ipHash);
    if (limit.limited) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const body = await request.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    if (!question || question.length > 500) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const [knowledgeRes, servicesRes, aboutRes, contactRes] = await Promise.all([
      supabase.from("ai_knowledge").select("*").eq("is_active", true),
      supabase.from("services").select("name, short_description, description").eq("status", "published"),
      supabase.from("about_content").select("*").limit(1).single(),
      supabase.from("contact_settings").select("*").limit(1).single(),
    ]);

    const dynamicEntries: AiKnowledge[] = [];

    if (servicesRes.data) {
      for (const s of servicesRes.data) {
        dynamicEntries.push({
          id: `service-${s.name}`,
          title: s.name,
          content: `${s.name}: ${s.short_description ?? ""} ${s.description ?? ""}`,
          category: "services",
          source: "website",
          keywords: [s.name.toLowerCase()],
          is_active: true,
          created_at: "",
          updated_at: "",
        });
      }
    }

    if (aboutRes.data) {
      dynamicEntries.push({
        id: "about",
        title: "About Williams Enterprises",
        content: `${aboutRes.data.main_description ?? ""} ${aboutRes.data.company_story ?? ""} Mission: ${aboutRes.data.mission ?? ""} Vision: ${aboutRes.data.vision ?? ""}`,
        category: "about",
        source: "website",
        keywords: ["about", "company", "mission", "vision"],
        is_active: true,
        created_at: "",
        updated_at: "",
      });
    }

    if (contactRes.data) {
      dynamicEntries.push({
        id: "contact",
        title: "Contact Information",
        content: `Phone: ${contactRes.data.phone ?? "[ADD COMPANY PHONE]"}. Email: ${contactRes.data.email ?? "[ADD EMAIL]"}. Address: ${contactRes.data.address ?? "[ADD COMPANY ADDRESS]"}. Hours: ${contactRes.data.business_hours ?? ""}`,
        category: "contact",
        source: "website",
        keywords: ["contact", "phone", "email", "address"],
        is_active: true,
        created_at: "",
        updated_at: "",
      });
    }

    const allKnowledge = [...(knowledgeRes.data ?? []), ...dynamicEntries];
    const results = rankKnowledge(question, allKnowledge);
    const answer = composeAnswer(question, results);

    return NextResponse.json({ answer, sources: results.map((r) => r.title) });
  } catch {
    return NextResponse.json(
      { error: "Unable to process your question. Please try again." },
      { status: 500 }
    );
  }
}
