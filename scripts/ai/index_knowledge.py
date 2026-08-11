#!/usr/bin/env python3
"""
Williams Enterprises — Stebo Ai Knowledge Indexer
Run offline to sync website content into ai_knowledge table.

Usage:
  pip install -r scripts/ai/requirements.txt
  python scripts/ai/index_knowledge.py

Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
(or NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
"""

import os
import json
from supabase import create_client

def get_client():
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise SystemExit("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)

def index_content(supabase):
    entries = []

    # Services
    services = supabase.table("services").select("name, short_description, description").eq("status", "published").execute()
    for s in services.data or []:
        entries.append({
            "title": s["name"],
            "content": f"{s['name']}: {s.get('short_description', '')} {s.get('description', '')}",
            "category": "services",
            "source": "indexer",
            "keywords": [s["name"].lower()],
            "is_active": True,
        })

    # About
    about = supabase.table("about_content").select("*").limit(1).execute()
    if about.data:
        a = about.data[0]
        entries.append({
            "title": "About Williams Enterprises",
            "content": f"{a.get('main_description', '')} {a.get('company_story', '')} Mission: {a.get('mission', '')} Vision: {a.get('vision', '')}",
            "category": "about",
            "source": "indexer",
            "keywords": ["about", "company", "mission"],
            "is_active": True,
        })

    # Contact
    contact = supabase.table("contact_settings").select("*").limit(1).execute()
    if contact.data:
        c = contact.data[0]
        entries.append({
            "title": "Contact Information",
            "content": f"Phone: {c.get('phone', '')}. Email: {c.get('email', '')}. Address: {c.get('address', '')}. Hours: {c.get('business_hours', '')}",
            "category": "contact",
            "source": "indexer",
            "keywords": ["contact", "phone", "email"],
            "is_active": True,
        })

    # Projects
    projects = supabase.table("projects").select("title, description, category").eq("status", "published").execute()
    for p in projects.data or []:
        entries.append({
            "title": f"Project: {p['title']}",
            "content": f"{p['title']} ({p.get('category', '')}): {p.get('description', '')}",
            "category": "projects",
            "source": "indexer",
            "keywords": ["project", p["title"].lower()],
            "is_active": True,
        })

    # Upsert indexed entries (delete old indexer entries first)
    supabase.table("ai_knowledge").delete().eq("source", "indexer").execute()

    for entry in entries:
        supabase.table("ai_knowledge").insert(entry).execute()

    print(f"Indexed {len(entries)} knowledge entries.")

if __name__ == "__main__":
    client = get_client()
    index_content(client)
