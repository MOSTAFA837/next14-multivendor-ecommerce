"use client";

import DOMPurify from "dompurify";

export default function Descriptions({ text }: { text: [string, string] }) {
  const sanitizedProductDesc = DOMPurify.sanitize(text[0]);
  const sanitizedVariantDesc = DOMPurify.sanitize(text[0]);

  return (
    <div className="pt-6">
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">Description</h2>
      </div>

      <div dangerouslySetInnerHTML={{ __html: sanitizedProductDesc }} />
      <div dangerouslySetInnerHTML={{ __html: sanitizedVariantDesc }} />
    </div>
  );
}
