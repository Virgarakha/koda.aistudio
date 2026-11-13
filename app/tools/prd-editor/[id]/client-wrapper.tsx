"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PrdDocumentEditor } from "@/components/editor/PrdDocumentEditor";

export function PrdEditorClientWrapper() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  return <PrdDocumentEditor docId={id} />;
}
