"use client";

import { useParams } from "next/navigation";
import Editor from "../../../components/Editor";

export default function BuilderSectionPage() {
  const params = useParams();         // { section: "home" } if folder is [section]
  const section = params.section;     // or params.slug if folder is [slug]

  console.log("Client – editing section:", section);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold capitalize">
        Editing: {section?.replace(/-/g, " ")}
      </h1>
      <Editor sectionKey={section} />
    </div>
  );
}
