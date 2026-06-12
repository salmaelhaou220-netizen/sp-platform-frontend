/**
 * Types of Situation de Problème (SP) offered to the user.
 * Each entry provides the identifier, label, accent colour and description.
 */
export const TYPE_SP = [
  {
    id: "didactique",
    label: "Didactique",
    color: "var(--accent)", // deep blue / emerald accent
    desc: "Séquence complète, couvre tout le module",
  },
  {
    id: "specific",
    label: "Spécifique",
    color: "var(--accent2)",
    desc: "Notion précise, à préciser dans le mini‑prompt",
  },
] as const;
