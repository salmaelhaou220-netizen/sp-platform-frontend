// GenerateSP.tsx – V5.3 compatible
import { useState, useEffect } from "react";
import SPResultDisplay from "../components/SPResultDisplay";
import { supabase } from "../lib/supabase";
import { exportAsPDF, exportAsWord } from "../utils/exportSP";

const BACKEND = "https://sp-platform-backend.onrender.com";

const NIVEAUX = ["débutant", "intermédiaire", "avancé"];
const LANGUES = ["français", "arabe"];
const NOMBRE_VARIANTES = [1, 2, 3, 4, 5];

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

export default function GenerateSP({ user }: { user: any }) {
  const [mode, setMode] = useState<"sequence" | "notion">("sequence");
  const [miniPrompt, setMiniPrompt] = useState("");
  const [niveauIdx, setNiveauIdx] = useState(1); // default: intermédiaire
  const [langueIdx, setLangueIdx] = useState(0); // default: français
  const [nombreVariantes, setNombreVariantes] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  // Dynamic sequences
  const [sequencesData, setSequencesData] = useState<Record<string, string[]>>({});
  const [modules, setModules] = useState<string[]>([]);
  const [sequences, setSequences] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSequence, setSelectedSequence] = useState("");
  const [loadingSequences, setLoadingSequences] = useState(true);

  // Fetch sequences on mount
  useEffect(() => {
    fetch(`${BACKEND}/sequences`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const data: Record<string, string[]> = json.data;
          setSequencesData(data);
          const moduleList = Object.keys(data);
          setModules(moduleList);
          if (moduleList.length > 0) {
            const firstModule = moduleList[0];
            setSelectedModule(firstModule);
            const seqs = data[firstModule] || [];
            setSequences(seqs);
            if (seqs.length > 0) setSelectedSequence(seqs[0]);
          }
        }
      })
      .catch(err => console.error("Failed to fetch sequences:", err))
      .finally(() => setLoadingSequences(false));
  }, []);

  // Update sequences when module changes
  useEffect(() => {
    if (selectedModule && sequencesData[selectedModule]) {
      const seqs = sequencesData[selectedModule];
      setSequences(seqs);
      setSelectedSequence(seqs[0] || "");
    }
  }, [selectedModule, sequencesData]);

  const handleGenerate = async () => {
    if (mode === "notion" && !miniPrompt.trim()) {
      setError("Décrivez la notion souhaitée.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    // Build body according to V5.3 API
    const body = mode === "sequence"
      ? {
        mode: "sequence",
        module: selectedModule,
        sequence: selectedSequence,
        type_sp: "didactique",
        nombre_variantes: nombreVariantes,
        niveau_difficulte: NIVEAUX[niveauIdx],
        langue: LANGUES[langueIdx],
      }
      : {
        mode: "notion",
        mini_prompt: miniPrompt,
        module: selectedModule,
        type_sp: "didactique",
        langue: LANGUES[langueIdx],
      };

    try {
      const res = await fetch(`${BACKEND}/generate-sp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      console.log("API response:", json); // debug

      if (json.success && json.data) {
        setResult(json.data);

        // Save to Supabase if user is logged in
        if (user) {
          try {
            const spData = json.data;
            const firstVariante = spData.variantes?.[0];
            await supabase.from("situations_problemes").insert({
              user_id: user.id,
              titre: firstVariante?.titre_sp || spData.sequence || "SP sans titre",
              type_sp: spData.type_sp || "didactique",
              module: spData.module || selectedModule,
              contenu_vise: spData.sequence || selectedSequence,
              profils_vark: ["didactique"],
              data: spData,
            });
          } catch (err) {
            console.error("Erreur sauvegarde Supabase:", err);
          }
        }
      } else {
        setError(json.detail || json.message || "Erreur lors de la génération.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const exportBtnStyle = (color: string): React.CSSProperties => ({
    padding: "10px 18px",
    borderRadius: 8,
    border: `1.5px solid ${color}`,
    background: "var(--bg2)",
    color: color,
    cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.2s",
  });

  return (
    <main style={{
      flex: 1,
      display: "grid",
      gridTemplateColumns: "340px 1fr",
      gap: 24,
      padding: "32px 24px 60px",
      maxWidth: 1200,
      margin: "0 auto",
      width: "100%",
      alignItems: "start",
    }}>

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: "28px 24px",
        position: "sticky",
        top: 24,
        maxHeight: "calc(100vh - 112px)",
        overflowY: "auto",
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>✦ Générer une SP</h2>
        <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 24 }}>Paramètres pédagogiques</p>

        {/* MODE SELECTOR */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {(["sequence", "notion"] as const).map(m => (
            <div key={m} onClick={() => setMode(m)} style={{
              flex: 1,
              textAlign: "center",
              padding: "12px 8px",
              borderRadius: 12,
              cursor: "pointer",
              border: `2px solid ${mode === m ? "var(--accent)" : "var(--border)"}`,
              background: mode === m ? "var(--accent-glow)" : "var(--bg3)",
              color: mode === m ? "var(--accent)" : "var(--text2)",
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {m === "sequence" ? "📚 Séquence" : "🎯 Notion"}
              </div>
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 3 }}>
                {m === "sequence" ? "Tous les savoirs" : "Notion précise"}
              </div>
            </div>
          ))}
        </div>

        {/* MODULE (always shown) */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Module</label>
          <select
            style={{
              ...selectStyle,
              opacity: loadingSequences ? 0.6 : 1,
              cursor: loadingSequences ? "not-allowed" : "pointer",
            }}
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value)}
            disabled={loadingSequences}
          >
            {loadingSequences
              ? <option value="">Chargement…</option>
              : modules.map(m => <option key={m} value={m}>{m}</option>)
            }
          </select>
        </div>

        {/* SEQUENCE (mode=sequence only) */}
        {mode === "sequence" && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Séquence</label>
            <select
              style={selectStyle}
              value={selectedSequence}
              onChange={e => setSelectedSequence(e.target.value)}
              disabled={loadingSequences || sequences.length === 0}
            >
              {sequences.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* MINI-PROMPT (mode=notion only) */}
        {mode === "notion" && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Décrivez la notion souhaitée</label>
            <textarea
              value={miniPrompt}
              onChange={e => setMiniPrompt(e.target.value)}
              placeholder="Ex: SP sur l'adressage absolu pour des élèves qui ont déjà vu les formules de base..."
              style={{
                width: "100%",
                minHeight: 90,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid var(--border)",
                background: "var(--bg3)",
                color: "var(--text)",
                fontFamily: "'Sora', sans-serif",
                fontSize: 13,
                resize: "vertical",
                outline: "none",
                lineHeight: 1.6,
              }}
            />
          </div>
        )}

        {/* NOMBRE DE VARIANTES (mode=sequence only) */}
        {mode === "sequence" && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nombre de variantes</label>
            <div style={{ display: "flex", gap: 8 }}>
              {NOMBRE_VARIANTES.map(n => (
                <button
                  key={n}
                  onClick={() => setNombreVariantes(n)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    border: `1.5px solid ${nombreVariantes === n ? "var(--accent)" : "var(--border)"}`,
                    background: nombreVariantes === n ? "var(--accent)" : "var(--bg3)",
                    color: nombreVariantes === n ? "#fff" : "var(--text2)",
                    cursor: "pointer",
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NIVEAU */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Niveau de difficulté</label>
          <select
            style={selectStyle}
            value={niveauIdx}
            onChange={e => setNiveauIdx(Number(e.target.value))}
          >
            {NIVEAUX.map((n, i) => <option key={i} value={i}>{n}</option>)}
          </select>
        </div>

        {/* LANGUE */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Langue</label>
          <select
            style={selectStyle}
            value={langueIdx}
            onChange={e => setLangueIdx(Number(e.target.value))}
          >
            {LANGUES.map((l, i) => <option key={i} value={i}>{l}</option>)}
          </select>
        </div>

        {/* GENERATE BUTTON */}
        <button
          onClick={handleGenerate}
          disabled={loading || loadingSequences}
          style={{
            width: "100%",
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s",
          }}
        >
          {loading
            ? <><span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span> Génération…</>
            : "⚡ Générer la SP"}
        </button>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div>
        {/* ERROR */}
        {error && (
          <div style={{
            padding: "14px 18px",
            borderRadius: 12,
            marginBottom: 20,
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.3)",
            color: "var(--red)",
            fontSize: 14,
          }}>⚠ {error}</div>
        )}

        {/* EMPTY STATE */}
        {!loading && !result && !error && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            gap: 16,
            color: "var(--text3)",
          }}>
            <div style={{ fontSize: 56, opacity: 0.3 }}>✦</div>
            <p style={{ fontSize: 15, textAlign: "center", lineHeight: 1.6 }}>
              Configurez les paramètres et cliquez sur<br />
              <strong style={{ color: "var(--accent)" }}>⚡ Générer la SP</strong>
            </p>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            gap: 20,
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "3px solid var(--border)",
              borderTopColor: "var(--accent)",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ color: "var(--text2)", fontSize: 14, textAlign: "center" }}>
              Génération en cours…<br />
              <span style={{ fontSize: 12, color: "var(--text3)" }}>
                (peut prendre 30–60s si le serveur est en veille)
              </span>
            </p>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <>
            {/* EXPORT BUTTONS */}
            <div style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              padding: "16px 20px",
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              alignItems: "center",
            }}>
              <span style={{ fontSize: 13, color: "var(--text2)", marginRight: 4 }}>
                Exporter :
              </span>
              <button
                onClick={() => exportAsPDF(result)}
                style={exportBtnStyle("var(--red)")}
              >
                🖨️ PDF
              </button>
              <button
                onClick={() => exportAsWord(result)}
                style={exportBtnStyle("var(--accent)")}
              >
                📄 Word
              </button>
            </div>

            {/* SP RESULT DISPLAY */}
            <SPResultDisplay result={result} />
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        select option {
          background: var(--bg2);
          color: var(--text);
        }
      `}</style>
    </main>
  );
}