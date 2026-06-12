import React from "react";

interface HomeProps {
  user?: any;
  onNavigate: (page: string) => void;
}

export default function Home({ user, onNavigate }: HomeProps) {
  const features = [
    {
      icon: "⚡",
      title: "Génération IA",
      desc: "Situations-problèmes générées automatiquement selon le module, le profil VARK et le niveau.",
      bgColor: "#EBF2FF",
      iconColor: "#3B6FF0",
    },
    {
      icon: "◈",
      title: "Évaluation /20",
      desc: "Évaluez vos SP sur 6 critères pédagogiques issus des travaux de Meirieu et Astolfi.",
      bgColor: "#F3E8FF",
      iconColor: "#6B4FD8",
    },
    {
      icon: "◉",
      title: "Différenciation VARK",
      desc: "Adaptation automatique au profil d'apprentissage : Visuel, Auditif, Lecture, Kinesthésique.",
      bgColor: "#E8F8F1",
      iconColor: "#1A9E68",
    },
    {
      icon: "⬡",
      title: "Export PDF/Word",
      desc: "Exportez vos situations-problèmes prêtes à l'emploi en classe directement.",
      bgColor: "#FEF3E2",
      iconColor: "#D97706",
    },
  ];

  return (
    <main style={{ flex: 1, padding: "0 24px 60px", background: "#F7F9FC" }}>
      {/* Hero */}
      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "80px 0 56px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Top Badge: blue pill with dot indicator */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 16px",
            borderRadius: 100,
            border: "1px solid #C7D9FD",
            background: "#EBF2FF",
            color: "#3B6FF0",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.05em",
            marginBottom: 28,
          }}
        >
          <span style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#3B6FF0",
            display: "inline-block",
            marginRight: 8,
          }} />
          IA Pédagogique · MEN Maroc 2005
        </div>

        {/* H1 Title with gradient on last word */}
        <h1
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#0F1117",
            lineHeight: 1.2,
            marginBottom: 20,
            maxWidth: 680,
          }}
        >
          Concevez des situations-problèmes pédagogiquement{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #3B6FF0, #6B4FD8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              display: "inline-block",
            }}
          >
            solides
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 18,
            color: "#4A5568",
            maxWidth: 520,
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Fondée sur les approches de Meirieu, Astolfi, Perrenoud et le modèle VARK, cette plateforme
          aide les enseignants d'informatique à créer des séquences riches de sens.
        </p>

        {/* CTA Buttons */}
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
              padding: "14px 28px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #3B6FF0, #6B4FD8)",
              color: "#FFFFFF",
              fontFamily: "'Sora', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(59,111,240,0.30)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(59,111,240,0.40)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(59,111,240,0.30)";
            }}
          >
            ✦ Générer une SP
          </button>

          <button
            onClick={() => onNavigate("evaluate")}
            style={{
              padding: "14px 28px",
              borderRadius: 10,
              border: "1.5px solid #DDE3ED",
              background: "#FFFFFF",
              color: "#0F1117",
              fontFamily: "'Sora', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B6FF0";
              (e.currentTarget as HTMLButtonElement).style.background = "#F0F4FF";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#DDE3ED";
              (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
            }}
          >
            ◈ Évaluer une SP
          </button>
        </div>
      </section>

      {/* Feature cards (4 cards grid, max-width 900px) */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              border: "1px solid #DDE3ED",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              transition: "all 0.2s ease",
              cursor: "default",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "#3B6FF0";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(59,111,240,0.12)";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "#DDE3ED";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            }}
          >
            {/* Icon circle 32px with colored background */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: f.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: f.iconColor,
                marginBottom: 16,
              }}
            >
              {f.icon}
            </div>
            
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#0F1117",
                marginBottom: 8,
              }}
            >
              {f.title}
            </h3>
            
            <p style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.65 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
