interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const features = [
    {
      icon: "⚡",
      title: "Génération IA",
      desc: "Situations-problèmes générées automatiquement selon le module, le profil VARK et le niveau.",
      color: "var(--accent)",
    },
    {
      icon: "◈",
      title: "Évaluation /20",
      desc: "Évaluez vos SP sur 6 critères pédagogiques issus des travaux de Meirieu et Astolfi.",
      color: "var(--accent2)",
    },
    {
      icon: "◉",
      title: "Différenciation VARK",
      desc: "Adaptation automatique au profil d'apprentissage : Visuel, Auditif, Lecture, Kinesthésique.",
      color: "var(--green)",
    },
    {
      icon: "⬡",
      title: "Export PDF/Word",
      desc: "Exportez vos situations-problèmes prêtes à l'emploi en classe directement.",
      color: "var(--orange)",
    },
  ];

  return (
    <main style={{ flex: 1, padding: "0 24px 60px" }}>
      {/* Hero */}
      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "80px 0 56px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 100,
            border: "1px solid var(--border)",
            background: "var(--accent-glow)",
            color: "var(--accent)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.05em",
            marginBottom: 28,
          }}
        >
          Tronc Commun · Maroc · IA Pédagogique
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 20,
            background: "linear-gradient(135deg, var(--text) 0%, var(--accent) 60%, var(--accent2) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Concevez des situations‑problèmes pédagogiquement solides
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "var(--text2)",
            maxWidth: 580,
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Fondée sur les approches de{" "}
          <span style={{ color: "var(--accent)" }}>Meirieu</span>,{" "}
          <span style={{ color: "var(--accent2)" }}>Astolfi</span>,{" "}
          <span style={{ color: "var(--green)" }}>Perrenoud</span> et le modèle{" "}
          <span style={{ color: "var(--orange)" }}>VARK</span>, cette plateforme
          aide les enseignants d'informatique à créer des séquences riches de sens.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => onNavigate("generate")}
            style={{
              padding: "14px 30px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: "#fff",
              fontFamily: "'Sora', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 24px var(--accent-glow)",
              transition: "opacity 0.2s, transform 0.15s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            ✦ Générer une SP
          </button>

          <button
            onClick={() => onNavigate("evaluate")}
            style={{
              padding: "14px 30px",
              borderRadius: 12,
              border: "1.5px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
              fontFamily: "'Sora', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s, transform 0.15s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-glow)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            ◈ Évaluer une SP
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
        }}
      >
        {features.map((f) => (
          <div
            key={f.title}
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "28px 24px",
              transition: "border-color 0.2s, transform 0.2s",
              cursor: "default",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = f.color;
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `color-mix(in srgb, ${f.color} 15%, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                marginBottom: 16,
                border: `1px solid color-mix(in srgb, ${f.color} 30%, transparent)`,
              }}
            >
              {f.icon}
            </div>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 8,
              }}
            >
              {f.title}
            </h3>
            <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.65 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
