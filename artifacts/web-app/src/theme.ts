// src/theme.ts
// Premium design system – CSS variables & helper

export const applyTheme = () => {
  const style = document.createElement('style');
  style.id = 'design-system';
  style.textContent = `
    :root {
      /* Colors – harmonious palette */
      --primary: hsl(215, 60%, 45%);          /* deep blue */
      --primary-light: hsl(215, 60%, 55%);
      --accent: hsl(260, 70%, 55%);           /* purple */
      --accent2: hsl(190, 70%, 45%);          /* teal */
      --orange: hsl(30, 90%, 55%);
      --red: hsl(0, 78%, 55%);
      --green: hsl(150, 55%, 45%);
      --bg-gradient: linear-gradient(135deg, #1e3a8a, #3b82f6);
      --bg1: hsl(220, 15%, 98%); /* page background */
      --bg2: hsl(220, 15%, 95%); /* cards */
      --bg3: hsl(220, 15%, 92%); /* inputs */
      --border: hsl(220, 10%, 80%);
      --text: hsl(220, 20%, 15%);
      --text2: hsl(220, 15%, 40%);
      --text3: hsl(220, 10%, 60%);
      --accent-glow: hsla(215, 60%, 70%, 0.1);
      --glass-bg: rgba(255,255,255,0.15);
      --glass-blur: blur(10px);
    }
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 4px 30px rgba(0,0,0,0.07);
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .rotate-spinner { animation: spin 0.8s linear infinite; }
  `;
  document.head.appendChild(style);
};
