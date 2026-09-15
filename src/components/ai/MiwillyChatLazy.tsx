"use client";

import dynamic from "next/dynamic";

const MiwillyChat = dynamic(() => import("./MiwillyChat"), {
  ssr: false,
});

export default function MiwillyChatLazy() {
  return <MiwillyChat />;
}
