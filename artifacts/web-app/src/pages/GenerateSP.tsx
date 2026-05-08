import { useState } from "react";

const BACKEND = "https://sp-platform-backend.onrender.com";

const MODULES = [
  "Module 1 — Généralités sur les systèmes informatiques",
  "Module 2 — Les logiciels",
  "Module 3 — Algorithmique et programmation",
  "Module 4 — Réseaux et Internet",
];

const CONTENUS: Record<number, string[]> = {
  0: [
    "Terminologie de base",
    "Structure d'un ordinateur",
    "Types de logiciels",
    "Domaines d'application",
  ],
  1: [
    "Système d'exploitation",
    "Gestion fichiers et dossiers",
    "Traitement de texte",
    "Tableur formules et adressage",
    "Tableur graphiques",
  ],
  2: [
    "Constantes variables types",
    "Instructions de base lecture écriture affectation",
    "Structure séquentielle",
    "Structure sélective",
    "Transcription algorithme",
  ],
  3: [
    "Notion de réseau",
    "Typologie réseaux LAN MAN WAN",
    "Internet connexion et services",
    "Éthique et citoyenneté numérique",
  ],
};

const VARK = [
  "V — Visuel",
  "A — Auditif",
  "R — Lecture-Écriture",
  "K — Kinesthésique",
  "Mixte",
];

const NIVEAUX = ["débutant", "intermédiaire", "avancé"];
const CONTEXTES = [
  "vie quotidienne",
  "monde professionnel",
  "environnement scolaire",
  "actualité technologique",
];
const LANGUES = ["français", "arabe"];

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid var(--border)",
  background: "var(--bg3)",
  color: "var(--text)",
  fontFamily: "'Sora', sans-serif",
  fontSize: 14,
  outline: "none",
  cursor: "pointer",
  transition: "border-color 0.2s",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b90a0' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: 36,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text3)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 7,
};

interface SPData {
  titre: string;
  module: string;
  profil_vark: string;
  duree_estimee: string;
  ancrage_theorique: {
    objectif_meirieu: string;
    obstacle_astolfi: string;
    sens_de_vecchi: string;
  };
  situation: {
    contexte: string;
    declencheur: string;
    question_centrale: string;
    supports_fournis: string[];
  };
  tache: {
    description: string;
    produit_attendu: string;
    criteres_reussite: string[];
  };
  dispositif_pedagogique: {
    organisation: string;
    etapes_suggerees: string[];
    role_enseignant: string;
  };
  differenciation_vark: {
    profil_applique: string;
    adaptation: string;
    variante_autre_profil: string;
  };
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 100,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        fontWeight: 600,
        border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        color: color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg3)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "20px 22px",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--accent)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <span style={{ ...labelStyle, display: "inline", marginBottom: 0 }}>{label} </span>
      <span style={{ fontSize: 14, color: "var(--text2)" }}>{value}</span>
    </div>
  );
}

export default function GenerateSP() {
  const [moduleIdx, setModuleIdx] = useState(0);
  const [contenu, setContenu] = useState(0);
  const [vark, setVark] = useState(0);
  const [niveau, setNiveau] = useState(0);
  const [contexte, setContexte] = useState(0);
  const [langue, setLangue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SPData | null>(null);
  const [error, setError] = useState("");

  const handleModuleChange = (idx: number) => {
    setModuleIdx(idx);
    setContenu(0);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const varkLetter = VARK[vark].charAt(0);
    const body = {
      module: MODULES[moduleIdx],
      contenu: CONTENUS[moduleIdx][contenu],
      competence: "Compétence officielle liée à : " + CONTENUS[moduleIdx][contenu],
      niveau_difficulte: NIVEAUX[niveau],
      profil_vark: varkLetter,
      contexte_souhaite: CONTEXTES[contexte],
      langue: LANGUES[langue],
    };

    try {
      const res = await fetch(`${BACKEND}/generate-sp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      } else {
        setError(json.message || "Erreur lors de la génération.");
      }
    } catch (e) {
      setError("Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        gap: 24,
        padding: "32px 24px 60px",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        alignItems: "start",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          padding: "28px 24px",
          position: "sticky",
          top: 24,
        }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
          ✦ Générer une SP
        </h2>
        <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 28 }}>
          Renseignez les paramètres pédagogiques
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Module */}
          <div>
            <label style={labelStyle}>Module</label>
            <select
              style={selectStyle}
              value={moduleIdx}
              onChange={(e) => handleModuleChange(Number(e.target.value))}
            >
              {MODULES.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>

          {/* Contenu visé */}
          <div>
            <label style={labelStyle}>Contenu visé</label>
            <select
              style={selectStyle}
              value={contenu}
              onChange={(e) => setContenu(Number(e.target.value))}
            >
              {CONTENUS[moduleIdx].map((c, i) => (
                <option key={i} value={i}>{c}</option>
              ))}
            </select>
          </div>

          {/* VARK */}
          <div>
            <label style={labelStyle}>Profil VARK</label>
            <select
              style={selectStyle}
              value={vark}
              onChange={(e) => setVark(Number(e.target.value))}
            >
              {VARK.map((v, i) => (
                <option key={i} value={i}>{v}</option>
              ))}
            </select>
          </div>

          {/* Niveau */}
          <div>
            <label style={labelStyle}>Niveau</label>
            <select
              style={selectStyle}
              value={niveau}
              onChange={(e) => setNiveau(Number(e.target.value))}
            >
              {NIVEAUX.map((n, i) => (
                <option key={i} value={i}>{n}</option>
              ))}
            </select>
          </div>

          {/* Contexte */}
          <div>
            <label style={labelStyle}>Contexte</label>
            <select
              style={selectStyle}
              value={contexte}
              onChange={(e) => setContexte(Number(e.target.value))}
            >
              {CONTEXTES.map((c, i) => (
                <option key={i} value={i}>{c}</option>
              ))}
            </select>
          </div>

          {/* Langue */}
          <div>
            <label style={labelStyle}>Langue</label>
            <select
              style={selectStyle}
              value={langue}
              onChange={(e) => setLangue(Number(e.target.value))}
            >
              {LANGUES.map((l, i) => (
                <option key={i} value={i}>{l}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "13px",
              borderRadius: 12,
              border: "none",
              background: loading
                ? "var(--bg3)"
                : "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: loading ? "var(--text3)" : "#fff",
              fontFamily: "'Sora', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span>
                Génération…
              </>
            ) : (
              "⚡ Générer la SP"
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div>
        {/* Error */}
        {error && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              background: "color-mix(in srgb, var(--red) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)",
              color: "var(--red)",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
              gap: 16,
              color: "var(--text3)",
            }}
          >
            <div style={{ fontSize: 56, opacity: 0.4 }}>✦</div>
            <p style={{ fontSize: 15, textAlign: "center" }}>
              Configurez les paramètres et cliquez sur<br />
              <strong style={{ color: "var(--accent)" }}>⚡ Générer la SP</strong>
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
              gap: 20,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid var(--border)",
                borderTopColor: "var(--accent)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "var(--text2)", fontSize: 14 }}>
              Génération en cours…
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div>
            {/* Header */}
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                padding: "24px 26px",
                marginBottom: 14,
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>
                {result.titre}
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Badge color="var(--accent)">{result.module}</Badge>
                <Badge color="var(--accent2)">VARK : {result.profil_vark}</Badge>
                <Badge color="var(--green)">⏱ {result.duree_estimee}</Badge>
              </div>
            </div>

            {/* Ancrage théorique */}
            <Section title="Ancrage théorique" icon="📚">
              <Row label="Meirieu :" value={result.ancrage_theorique.objectif_meirieu} />
              <Row label="Astolfi :" value={result.ancrage_theorique.obstacle_astolfi} />
              <Row label="De Vecchi :" value={result.ancrage_theorique.sens_de_vecchi} />
            </Section>

            {/* Situation */}
            <Section title="Situation" icon="🎯">
              <Row label="Contexte :" value={result.situation.contexte} />
              <Row label="Déclencheur :" value={result.situation.declencheur} />
              <Row label="Question centrale :" value={result.situation.question_centrale} />
              {result.situation.supports_fournis?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <span style={{ ...labelStyle, display: "block" }}>Supports fournis</span>
                  <ul style={{ paddingLeft: 18, color: "var(--text2)", fontSize: 14 }}>
                    {result.situation.supports_fournis.map((s, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>

            {/* Tâche */}
            <Section title="Tâche" icon="✏️">
              <Row label="Description :" value={result.tache.description} />
              <Row label="Produit attendu :" value={result.tache.produit_attendu} />
              {result.tache.criteres_reussite?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <span style={{ ...labelStyle, display: "block" }}>Critères de réussite</span>
                  {result.tache.criteres_reussite.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        marginBottom: 7,
                        fontSize: 14,
                        color: "var(--text2)",
                      }}
                    >
                      <span style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Dispositif pédagogique */}
            <Section title="Dispositif pédagogique" icon="🏫">
              <Row label="Organisation :" value={result.dispositif_pedagogique.organisation} />
              {result.dispositif_pedagogique.etapes_suggerees?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ ...labelStyle, display: "block" }}>Étapes suggérées</span>
                  {result.dispositif_pedagogique.etapes_suggerees.map((e, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 7,
                        fontSize: 14,
                        color: "var(--text2)",
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "var(--accent-glow)",
                          color: "var(--accent)",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              )}
              <Row label="Rôle enseignant :" value={result.dispositif_pedagogique.role_enseignant} />
            </Section>

            {/* Différenciation VARK */}
            <Section title="Différenciation VARK" icon="◉">
              <Row label="Profil appliqué :" value={result.differenciation_vark.profil_applique} />
              <Row label="Adaptation :" value={result.differenciation_vark.adaptation} />
              <Row label="Variante autre profil :" value={result.differenciation_vark.variante_autre_profil} />
            </Section>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--bg2); color: var(--text); }
      `}</style>
    </main>
  );
}
