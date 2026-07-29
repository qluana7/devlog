import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  "figure",
  "figcaption",
  "img"
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  "*": ["class", "id", "role", "tabindex", "aria-label", "aria-expanded"],
  a: ["href", "name", "target", "rel", "title"],
  img: ["src", "alt", "title", "loading", "decoding", "width", "height"],
  ol: ["start", "reversed", "type"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan", "scope"]
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"]
    },
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    transformTags: {
      a(tagName, attributes) {
        if (attributes.target !== "_blank") {
          const { target: _target, ...safeAttributes } = attributes;
          return { tagName, attribs: safeAttributes };
        }

        const rel = new Set((attributes.rel || "").split(/\s+/).filter(Boolean));
        rel.add("noopener");
        rel.add("noreferrer");
        return {
          tagName,
          attribs: {
            ...attributes,
            rel: [...rel].join(" ")
          }
        };
      }
    }
  });
}
