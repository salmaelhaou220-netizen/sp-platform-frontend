import React, { useState } from "react";
import { supabase } from "../lib/supabase";

interface RegisterPageProps {
  setPage: (page: string) => void;
}

export default function RegisterPage({ setPage }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (err) {
        setError(err.message);
      } else {
        setSuccess(true);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (err) {
        setError(err.message);
      }
    } catch (err: any) {
      setError("Impossible de se connecter avec Google.");
    }
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#F7F9FC",
    padding: "24px 16px",
    transition: "all 0.2s ease",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 420,
    background: "#FFFFFF",
    border: "1px solid #DDE3ED",
    borderRadius: 16,
    padding: 40,
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)", // shadow-lg
    display: "flex",
    flexDirection: "column",
    gap: 24,
  };

  const logoContainerStyle: React.CSSProperties = {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  };

  const logoCircleStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3B6FF0, #6B4FD8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 800,
    color: "#0F1117",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 13,
    color: "#4A5568",
    lineHeight: 1.5,
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 600,
    color: "#4A5568",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid #DDE3ED",
    background: "#FFFFFF",
    color: "#0F1117",
    fontFamily: "'Sora', sans-serif",
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s ease",
  };

  const passwordWrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const toggleBtnStyle: React.CSSProperties = {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    color: "#9BA3BB",
    cursor: "pointer",
    fontSize: 16,
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const registerBtnStyle = (isLoading: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "11px 20px",
    borderRadius: 8,
    border: "none",
    background: isLoading
      ? "#EEF2F7"
      : "linear-gradient(135deg, #3B6FF0, #6B4FD8)",
    color: isLoading ? "#9BA3BB" : "#FFFFFF",
    fontFamily: "'Sora', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: isLoading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 2px 8px rgba(59,111,240,0.25)",
    transition: "all 0.2s ease",
    marginTop: 8,
  });

  const dividerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: "#9BA3BB",
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase",
  };

  const lineStyle: React.CSSProperties = {
    flex: 1,
    height: 1,
    background: "#DDE3ED",
  };

  const googleBtnStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: 8,
    border: "1.5px solid #DDE3ED",
    background: "#FFFFFF",
    color: "#0F1117",
    fontFamily: "'Sora', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    transition: "all 0.2s ease",
  };

  const linkStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: 13,
    color: "#4A5568",
  };

  const activeLinkStyle: React.CSSProperties = {
    color: "#3B6FF0",
    fontWeight: 600,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontFamily: "'Sora', sans-serif",
    fontSize: 13,
  };

  const successBoxStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: 8,
    background: "#E8F8F1",
    border: "1px solid #A7F3D0",
    color: "#1A9E68",
    fontSize: 13,
    lineHeight: 1.5,
  };

  const errorBoxStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: 8,
    background: "#FEE2E2",
    border: "1px solid #FCA5A5",
    color: "#DC2626",
    fontSize: 13,
    lineHeight: 1.5,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header Logo & Titles */}
        <div style={logoContainerStyle}>
          <div style={logoCircleStyle}>⚡</div>
          <h1 style={titleStyle}>Créer un compte</h1>
          <p style={subtitleStyle}>Rejoignez la plateforme SP</p>
        </div>

        {/* Success Feedback */}
        {success && (
          <div style={successBoxStyle}>
            ✓ Vérifiez votre email pour confirmer votre inscription.
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div style={errorBoxStyle}>
            ⚠ {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleRegister} style={formStyle}>
          <div>
            <label style={labelStyle} htmlFor="register-name">Nom complet</label>
            <input
              id="register-name"
              type="text"
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prof. Mohamed Alami"
              required
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3B6FF0";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,111,240,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#DDE3ED";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="register-email">Adresse e-mail</label>
            <input
              id="register-email"
              type="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prof@ecole.ma"
              required
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3B6FF0";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,111,240,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#DDE3ED";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="register-password">Mot de passe</label>
            <div style={passwordWrapperStyle}>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: 40 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                required
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3B6FF0";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,111,240,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#DDE3ED";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={toggleBtnStyle}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle} htmlFor="register-confirm">Confirmer le mot de passe</label>
            <div style={passwordWrapperStyle}>
              <input
                id="register-confirm"
                type={showConfirmPassword ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: 40 }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3B6FF0";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,111,240,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#DDE3ED";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={toggleBtnStyle}
                title={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirmPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={registerBtnStyle(loading)}
            onMouseOver={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(59,111,240,0.35)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(59,111,240,0.25)";
              }
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span>
                Inscription…
              </>
            ) : (
              "Créer mon compte"
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={dividerStyle}>
          <div style={lineStyle} />
          <span>ou</span>
          <div style={lineStyle} />
        </div>

        {/* OAuth Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={googleBtnStyle}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B6FF0";
            (e.currentTarget as HTMLButtonElement).style.background = "#F0F4FF";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#DDE3ED";
            (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.927h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.053h3.87c2.26-2.09 3.57-5.17 3.57-8.82z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.053c-1.08.72-2.45 1.16-4.06 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.153C3.18 21.88 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.32 14.237a7.16 7.16 0 0 1 0-4.474V6.61H1.21a11.94 11.94 0 0 0 0 10.78l4.11-3.153z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 6.61l4.11 3.153c.94-2.85 3.57-4.96 6.68-4.96z"
            />
          </svg>
          <span style={{ color: "#0F1117" }}>Continuer avec Google</span>
        </button>

        {/* Footer Link */}
        <p style={linkStyle}>
          Déjà un compte ?{" "}
          <button
            type="button"
            onClick={() => setPage("login")}
            style={activeLinkStyle}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.textDecoration = "none";
            }}
          >
            Se connecter
          </button>
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
