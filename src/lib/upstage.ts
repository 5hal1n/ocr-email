export type UpstageContent = {
  html: string;
  markdown: string;
  text: string;
};

export type UpstageElement = {
  category:
  | "heading1"
  | "heading2"
  | "heading3"
  | "paragraph"
  | "table"
  | "figure"
  | "chart"
  | "equation"
  | "list"
  | "caption"
  | "header"
  | "footer"
  | "page_number"
  | "footnote"
  | string;
  content: UpstageContent;
  coordinates: Array<[number, number]>;
  id: number;
  page: number;
};

export type UpstageResponse = {
  content: UpstageContent;
  elements: UpstageElement[];
  mimetype?: string;
  model?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Parses a document using the Upstage Document Parse API.
 *
 * @param file - The file to parse. Can be a File or Blob.
 * @param options - Optional configuration.
 * @param options.apiKey - The Upstage API key. Defaults to process.env.UPSTAGE_API_KEY.
 * @param options.ocr - Whether to force OCR. Defaults to "auto".
 * @param options.model - The model to use. Defaults to "document-parse".
 * @returns The parsed document data.
 */
export async function parseDocument(
  file: File | Blob,
  options: {
    apiKey?: string;
  } = {},
): Promise<UpstageResponse> {
  const apiKey = options.apiKey || process.env.UPSTAGE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Upstage API key");
  }

  const formData = new FormData();
  formData.append("document", file);
  formData.append("model", "document-parse-250618");
  formData.append("ocr", "auto");
  formData.append("chart_recognition", "true");
  formData.append("coordinates", "true");
  formData.append("output_formats", JSON.stringify(["html", "markdown"]));
  formData.append("base64_encoding", JSON.stringify(["figure"]));

  const response = await fetch(
    "https://api.upstage.ai/v1/document-digitization",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Upstage API failed with status ${response.status}: ${errorText}`,
    );
  }

  return response.json();
}
