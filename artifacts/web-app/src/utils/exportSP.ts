// utils/exportSP.ts
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  Document as DocxDocument,
  Paragraph,
  TextRun,
  Packer,
  Table,
  TableRow,
  TableCell,
  BorderStyle
} from "docx";
import { saveAs } from "file-saver";
import type { SPResult } from "../components/SPResultDisplay";

// Helper interfaces to structure type checking in this file
interface Question {
  numero: number;
  badge: string;
  question: string;
  objectif?: string;
  metacognition?: string | null;
  indice?: string | null;
  coups_de_pouce?: {
    niveau_1_conceptuel: string;
    niveau_2_procedural: string;
  };
}

interface SimulateurProfil {
  emoji: string;
  profil: string;
  reponse_simulee: string;
  erreur_revelee?: string;
  ce_qui_manque?: string;
  ce_que_cela_revele?: string;
  question_relance?: string;
  comment_canaliser?: string;
  attitude_pedagogique: string;
  mission_bonus?: string;
}

/**
 * Clean text to remove emojis and replace unsupported PDF characters.
 * Helvetica default font in jsPDF only supports WinAnsiEncoding (Latin-1).
 */
function cleanText(text: string): string {
  if (!text) return "";
  // 1. Strip emojis and other symbols outside standard WinAnsi range
  let cleaned = text.replace(
    /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g,
    ""
  );

  // 2. Replace smart quotes, ligatures, dashes and ellipsis
  cleaned = cleaned
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/”/g, '"')
    .replace(/“/g, '"')
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/…/g, "...");

  return cleaned;
}

/**
 * Generate a safe file name based on module and current date.
 * Example: sp_introduction-algorithmique_2026-06-07.pdf
 */
function getFileName(result: SPResult, ext: string): string {
  const date = new Date().toISOString().split("T")[0];
  const moduleName = (result.module || "sp")
    .toLowerCase()
    .replace(/[\s—]+/g, "-") // replace spaces and em dash with hyphen
    .replace(/[^a-z0-9\-]/g, "");
  return `sp_${moduleName}_${date}.${ext}`;
}

/** Helper class for managing jsPDF line wrapping, margins, colors and pagination */
class PDFBuilder {
  doc: jsPDF;
  y: number;
  lineHeight: number;
  pageHeight: number;
  topMargin: number;
  bottomMargin: number;
  leftMargin: number;
  contentWidth: number;

  constructor(doc: jsPDF) {
    this.doc = doc;
    this.y = 20;
    this.lineHeight = 6.5;
    this.pageHeight = doc.internal.pageSize.getHeight();
    this.topMargin = 20;
    this.bottomMargin = 20;
    this.leftMargin = 20;
    this.contentWidth = doc.internal.pageSize.getWidth() - 2 * this.leftMargin;
  }

  checkPageBreak(neededHeight: number = this.lineHeight): boolean {
    if (this.y + neededHeight > this.pageHeight - this.bottomMargin) {
      this.doc.addPage();
      this.y = this.topMargin;
      return true;
    }
    return false;
  }

  addText(
    text: string,
    options?: { bold?: boolean; size?: number; color?: [number, number, number]; indent?: number }
  ): void {
    const cleanedText = cleanText(text);
    if (options?.size) this.doc.setFontSize(options.size);
    if (options?.bold) {
      this.doc.setFont("helvetica", "bold");
    } else {
      this.doc.setFont("helvetica", "normal");
    }
    if (options?.color) {
      this.doc.setTextColor(options.color[0], options.color[1], options.color[2]);
    } else {
      this.doc.setTextColor(31, 41, 55); // Dark Slate default
    }

    const indent = options?.indent ?? 0;
    const x = this.leftMargin + indent;
    const width = this.contentWidth - indent;

    const lines = this.doc.splitTextToSize(cleanedText, width);
    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, x, this.y);
      this.y += this.lineHeight;
    });
  }

  addSectionHeader(title: string, color: [number, number, number] = [26, 86, 219]): void {
    const cleanedTitle = cleanText(title);
    this.checkPageBreak(18);
    this.y += 4;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(color[0], color[1], color[2]);
    this.doc.text(cleanedTitle.toUpperCase(), this.leftMargin, this.y);

    // Underline
    this.y += 2;
    this.doc.setDrawColor(color[0], color[1], color[2]);
    this.doc.setLineWidth(1);
    this.doc.line(this.leftMargin, this.y, this.leftMargin + 30, this.y);

    this.y += 6;
  }

  addHeading(text: string, level: 1 | 2 | 3): void {
    const sizes = { 1: 14, 2: 11, 3: 9.5 };
    const spacingBefore = { 1: 10, 2: 7, 3: 5 };
    const colors: Record<number, [number, number, number]> = {
      1: [26, 86, 219],   // Deep blue
      2: [217, 119, 6],   // Accent Orange/Amber
      3: [75, 85, 99]     // Slate Gray
    };

    this.y += spacingBefore[level];
    this.addText(text, { bold: true, size: sizes[level], color: colors[level] });
    this.y += 2;
  }

  addBadgeRow(badges: { text: string; color: [number, number, number] }[]): void {
    this.checkPageBreak(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.5);

    let currentX = this.leftMargin;
    const paddingX = 4;
    const paddingY = 2;
    const badgeHeight = 5.5;

    badges.forEach((b) => {
      const cleanedLabel = cleanText(b.text);
      const textWidth = this.doc.getTextWidth(cleanedLabel);
      const badgeWidth = textWidth + paddingX * 2;

      if (currentX + badgeWidth > this.leftMargin + this.contentWidth) {
        currentX = this.leftMargin;
        this.y += badgeHeight + 3;
        this.checkPageBreak();
      }

      // Draw background rounded rectangle
      this.doc.setFillColor(b.color[0], b.color[1], b.color[2]);
      this.doc.roundedRect(currentX, this.y, badgeWidth, badgeHeight, 1.2, 1.2, "F");

      // Draw text
      this.doc.setTextColor(255, 255, 255);
      this.doc.text(cleanedLabel, currentX + paddingX, this.y + badgeHeight - paddingY);

      currentX += badgeWidth + 3;
    });

    this.y += badgeHeight + 5;
  }

  addKeyValue(key: string, value: string): void {
    if (!value) return;
    this.checkPageBreak();
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(75, 85, 99);
    const cleanedKey = cleanText(key) + " : ";
    const keyWidth = this.doc.getTextWidth(cleanedKey);

    this.doc.text(cleanedKey, this.leftMargin, this.y);

    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(31, 41, 55);

    const x = this.leftMargin + keyWidth;
    const width = this.contentWidth - keyWidth;

    const cleanedVal = cleanText(value);
    const lines = this.doc.splitTextToSize(cleanedVal, width);

    lines.forEach((line: string, index: number) => {
      this.checkPageBreak();
      if (index === 0) {
        this.doc.text(line, x, this.y);
      } else {
        this.doc.text(line, this.leftMargin, this.y);
      }
      this.y += this.lineHeight;
    });
    this.y += 1;
  }

  addCalloutBox(
    title: string,
    lines: string[],
    borderColor: [number, number, number] = [26, 86, 219],
    bgColor: [number, number, number] = [243, 248, 255]
  ): void {
    const cleanedTitle = cleanText(title);
    const cleanedLines = lines.map(cleanText);

    // Calculate total height of box
    let boxHeight = 4; // Padding top/bottom
    if (cleanedTitle) boxHeight += 6;

    const textWidth = this.contentWidth - 6; // Inner width
    const formattedLines: string[] = [];

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);

    cleanedLines.forEach((l) => {
      const split = this.doc.splitTextToSize(l, textWidth);
      formattedLines.push(...split);
    });

    boxHeight += formattedLines.length * this.lineHeight;

    // Check pagination
    this.checkPageBreak(boxHeight + 4);

    const startY = this.y;

    // Background
    this.doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    this.doc.rect(this.leftMargin, startY, this.contentWidth, boxHeight, "F");

    // Left Border
    this.doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    this.doc.setLineWidth(1.5);
    this.doc.line(this.leftMargin, startY, this.leftMargin, startY + boxHeight);

    this.y += 5;

    if (cleanedTitle) {
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9.5);
      this.doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
      this.doc.text(cleanedTitle, this.leftMargin + 4, this.y);
      this.y += 5.5;
    }

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(31, 41, 55);

    formattedLines.forEach((line) => {
      this.doc.text(line, this.leftMargin + 4, this.y);
      this.y += this.lineHeight;
    });

    this.y = startY + boxHeight + 4;
  }

  addBullet(text: string, indent: number = 0, prefixColor: [number, number, number] = [31, 41, 55]): void {
    const cleanedText = cleanText(text);
    this.checkPageBreak();
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(31, 41, 55);

    const prefix = "• ";
    const prefixWidth = this.doc.getTextWidth(prefix);
    const bulletLeft = this.leftMargin + indent;
    const textLeft = bulletLeft + prefixWidth;
    const textWidth = this.contentWidth - indent - prefixWidth;

    const lines = this.doc.splitTextToSize(cleanedText, textWidth);
    lines.forEach((line: string, index: number) => {
      this.checkPageBreak();
      if (index === 0) {
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(prefixColor[0], prefixColor[1], prefixColor[2]);
        this.doc.text(prefix, bulletLeft, this.y);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(31, 41, 55);
      }
      this.doc.text(line, textLeft, this.y);
      this.y += this.lineHeight;
    });
  }

  addHorizontalLine(): void {
    this.checkPageBreak(8);
    this.y += 4;
    this.doc.setDrawColor(229, 231, 235); // Very soft gray
    this.doc.setLineWidth(0.8);
    this.doc.line(this.leftMargin, this.y, this.leftMargin + this.contentWidth, this.y);
    this.y += 5;
  }
}

/** Export result as PDF using jsPDF */
export function exportAsPDF(result: SPResult): void {
  const doc = new jsPDF();
  const builder = new PDFBuilder(doc);

  // Main Header (emojis removed to avoid encoding errors)
  builder.addText("SITUATIONS-PROBLEMES GENEREE", { bold: true, size: 8.5, color: [107, 114, 128] });
  builder.addText(result.sequence || "Séquence", { bold: true, size: 18, color: [26, 86, 219] });
  builder.y += 4;

  const metadataBadges: { text: string; color: [number, number, number] }[] = [];
  if (result.duree_estimee) {
    metadataBadges.push({ text: result.duree_estimee, color: [107, 114, 128] });
  }
  builder.addBadgeRow(metadataBadges);

  builder.addKeyValue("Module", result.module);
  if (result.savoirs_couverts && result.savoirs_couverts.length > 0) {
    builder.addKeyValue("Savoirs couverts", result.savoirs_couverts.join(", "));
  }

  // Iterate over each variant
  result.variantes?.forEach((v) => {
    builder.addHorizontalLine();
    builder.addText(`Variante ${v.numero} : ${v.contexte_theme}`, { bold: true, size: 13, color: [26, 86, 219] });
    builder.y += 3;

    if (v.titre_sp) {
      builder.addKeyValue("Titre de la SP", v.titre_sp);
    }

    if (v.fil_conducteur) {
      builder.addKeyValue("Fil conducteur", v.fil_conducteur);
    }

    // Lancement multimodal global (pitch + image)
    if (v.multimodal_global) {
      const launchLines: string[] = [];
      if (v.multimodal_global.pitch_oral) {
        launchLines.push(`Pitch oral : "${v.multimodal_global.pitch_oral}"`);
      }
      if (v.multimodal_global.image_declenchante?.description_pedagogique) {
        launchLines.push(
          `Image declenchante : ${v.multimodal_global.image_declenchante.description_pedagogique} (Mots-cles : ${v.multimodal_global.image_declenchante.mots_cles_unsplash})`
        );
      }

      if (launchLines.length > 0) {
        builder.addSectionHeader("Lancement multimodal global", [26, 86, 219]);
        builder.addCalloutBox("", launchLines, [217, 119, 6], [255, 251, 235]); // Amber border, Warm bg
      }
    }

    // Paliers d'apprentissage
    if (v.paliers && v.paliers.length > 0) {
      v.paliers.forEach((p) => {
        builder.addHorizontalLine();
        builder.addText(`Palier ${p.numero_palier} : ${p.titre_palier}`, { bold: true, size: 11, color: [26, 86, 219] });
        builder.y += 2;

        // Action kinesthésique
        if (p.action_kinesthesique) {
          builder.addKeyValue("Action kinesthésique", p.action_kinesthesique);
        }

        // Obstacle épistémologique
        if (p.obstacle_epistemologique) {
          builder.addSectionHeader("Obstacle epistemologique", [217, 119, 6]);
          const obstacleLines = [
            `Obstacle : ${p.obstacle_epistemologique.formulation}`,
            `Erreur typique : ${p.obstacle_epistemologique.erreur_typique}`,
          ];
          if (p.obstacle_epistemologique.origine_confusion) {
            obstacleLines.push(`Origine : ${p.obstacle_epistemologique.origine_confusion}`);
          }
          if (p.obstacle_epistemologique.contraintes_pedagogiques && p.obstacle_epistemologique.contraintes_pedagogiques.length > 0) {
            obstacleLines.push(`Contraintes : ${p.obstacle_epistemologique.contraintes_pedagogiques.join(", ")}`);
          }
          builder.addCalloutBox("", obstacleLines, [220, 38, 38], [254, 242, 242]);
        }

        // Situation partielle
        if (p.situation_partielle) {
          builder.addSectionHeader("Situation partielle", [26, 86, 219]);
          const situationLines = [p.situation_partielle.texte, `Tache finale : ${p.situation_partielle.tache_finale}`];
          builder.addCalloutBox("", situationLines, [26, 86, 219], [243, 248, 255]);
        }

        // Questions de guidage
        if (p.questions) {
          builder.addSectionHeader("Questions de guidage differenciees", [26, 86, 219]);
          if (p.questions.consigne_enseignant) {
            builder.addText(`Consigne : ${p.questions.consigne_enseignant}`, {
              bold: true,
              size: 9.5,
              color: [107, 114, 128],
            });
            builder.y += 2;
          }

          const renderQuestions = (title: string, questions?: Question[], titleColor?: [number, number, number]) => {
            if (!questions || questions.length === 0 || !titleColor) return;
            builder.addHeading(title, 3);
            questions.forEach((q) => {
              builder.addBullet(`Q${q.numero} [${q.badge}] : ${q.question}`, 8, titleColor);
              if (q.objectif) {
                builder.addText(`Objectif : ${q.objectif}`, { size: 8.5, color: [107, 114, 128], indent: 14 });
              }
              if (q.metacognition) {
                builder.addText(`Metacognition : ${q.metacognition}`, { size: 8.5, color: [107, 114, 128], indent: 14 });
              }
              if (q.indice) {
                builder.addText(`Indice : ${q.indice}`, { size: 8.5, color: [107, 114, 128], indent: 14 });
              }
              if (q.coups_de_pouce) {
                builder.addText(`N1 Conceptuel : ${q.coups_de_pouce.niveau_1_conceptuel}`, {
                  size: 8.5,
                  color: [185, 28, 28],
                  indent: 14,
                });
                builder.addText(`N2 Procedural : ${q.coups_de_pouce.niveau_2_procedural}`, {
                  size: 8.5,
                  color: [185, 28, 28],
                  indent: 14,
                });
              }
              builder.y += 1;
            });
            builder.y += 2;
          };

          renderQuestions("SOCLE COMMUN - Accessible a tous", p.questions.niveau_socle, [5, 150, 105]);
          renderQuestions("APPROFONDISSEMENT - Conflit cognitif", p.questions.niveau_intermediaire, [217, 119, 6]);
          renderQuestions("DEPASSEMENT - Pour aller plus loin", p.questions.niveau_depassement, [124, 58, 237]);

          if (p.questions.criteres_reussite && p.questions.criteres_reussite.length > 0) {
            builder.addHeading("Criteres de reussite", 3);
            p.questions.criteres_reussite.forEach((c) => {
              builder.addBullet(c, 8, [5, 150, 105]);
            });
          }
        }

        // Simulateur de classe
        if (p.simulateur_classe) {
          builder.addSectionHeader("Simulateur de classe", [124, 58, 237]);
          if (p.simulateur_classe.contexte_simulateur) {
            builder.addText(p.simulateur_classe.contexte_simulateur);
            builder.y += 2;
          }
          if (p.simulateur_classe.question_cible) {
            builder.addKeyValue("Question cible", p.simulateur_classe.question_cible);
            builder.y += 2;
          }

          const renderProfil = (
            profil: SimulateurProfil,
            border: [number, number, number],
            bg: [number, number, number]
          ) => {
            if (!profil) return;
            const profileLines = [`Reponse simulee : "${profil.reponse_simulee}"`];
            if (profil.erreur_revelee) profileLines.push(`Erreur revelee : ${profil.erreur_revelee}`);
            if (profil.ce_qui_manque) profileLines.push(`Ce qui manque : ${profil.ce_qui_manque}`);
            if (profil.ce_que_cela_revele) profileLines.push(`Ce que ca revele : ${profil.ce_que_cela_revele}`);
            if (profil.question_relance) profileLines.push(`Question de relance : ${profil.question_relance}`);
            if (profil.comment_canaliser) profileLines.push(`Comment canaliser : ${profil.comment_canaliser}`);
            profileLines.push(`Attitude pedagogique : ${profil.attitude_pedagogique}`);
            if (profil.mission_bonus) profileLines.push(`Mission bonus : ${profil.mission_bonus}`);

            builder.addCalloutBox(`${profil.emoji} ${profil.profil}`, profileLines, border, bg);
          };

          renderProfil(p.simulateur_classe.eleve_difficulte, [220, 38, 38], [254, 242, 242]); // Red
          renderProfil(p.simulateur_classe.eleve_moyen, [217, 119, 6], [255, 251, 235]); // Amber
          renderProfil(p.simulateur_classe.eleve_avance, [26, 86, 219], [243, 248, 255]); // Blue
        }

        // Mise en œuvre séance
        if (p.mise_en_oeuvre_seance) {
          builder.addSectionHeader("Mise en oeuvre - seance", [26, 86, 219]);
          if (p.mise_en_oeuvre_seance.organisation) {
            builder.addKeyValue("Organisation", p.mise_en_oeuvre_seance.organisation);
          }
          if (p.mise_en_oeuvre_seance.duree_totale) {
            builder.addKeyValue("Duree totale", p.mise_en_oeuvre_seance.duree_totale);
          }
          builder.y += 2;

          if (p.mise_en_oeuvre_seance.phases && p.mise_en_oeuvre_seance.phases.length > 0) {
            builder.addHeading("Phases de la seance", 3);
            p.mise_en_oeuvre_seance.phases.forEach((ph) => {
              builder.addText(`Phase ${ph.numero} : ${ph.nom} (${ph.duree})`, { bold: true, size: 9.5, color: [26, 86, 219] });
              builder.addBullet(`Role Enseignant : ${ph.role_enseignant}`, 12, [75, 85, 99]);
              builder.addBullet(`Role Eleve : ${ph.role_eleve}`, 12, [75, 85, 99]);
              builder.addBullet(`Consigne cle : ${ph.consigne_cle}`, 12, [75, 85, 99]);
              builder.y += 1.5;
            });
          }
        }

        // Synthèse tableau palier
        if (p.synthese_tableau_palier) {
          const s = p.synthese_tableau_palier;
          builder.addSectionHeader("Synthese Notionnelle - Palier", [75, 85, 99]);
          builder.addKeyValue("Notion", s.titre_notion);
          builder.addKeyValue("Definition", s.definition);
          builder.addKeyValue("Regle essentielle", s.regle_essentielle);
          builder.addKeyValue("Exemple de projet", s.exemple_projet);
        }
      });
    }

    // Séance de synthèse finale
    if (v.seance_synthese_finale) {
      builder.addSectionHeader("Synthese Finale de Sequence", [124, 58, 237]);
      if (v.seance_synthese_finale.titre) {
        builder.addText(v.seance_synthese_finale.titre, { bold: true, size: 10, color: [31, 41, 55] });
        builder.y += 2;
      }
      if (v.seance_synthese_finale.contenu) {
        builder.addText(v.seance_synthese_finale.contenu);
        builder.y += 2;
      }
      if (v.seance_synthese_finale.tableau) {
        const t = v.seance_synthese_finale.tableau;
        builder.addHeading("Tableau de synthese finale", 3);
        builder.addKeyValue("Notion", t.titre_notion);
        builder.addKeyValue("Definition", t.definition);
        builder.addKeyValue("Regle essentielle", t.regle_essentielle);
        builder.addKeyValue("Exemple de projet", t.exemple_projet);
      }
    }

    // Auto-évaluation
    if (v.auto_evaluation_enseignant) {
      builder.addSectionHeader("Auto-evaluation enseignant", [5, 150, 105]);
      if (v.auto_evaluation_enseignant.checklist && v.auto_evaluation_enseignant.checklist.length > 0) {
        builder.addHeading("Checklist de preparation", 3);
        v.auto_evaluation_enseignant.checklist.forEach((item) => {
          builder.addBullet(`[ ] ${item}`, 8, [107, 114, 128]);
        });
        builder.y += 2;
      }
      if (v.auto_evaluation_enseignant.indicateurs_reussite && v.auto_evaluation_enseignant.indicateurs_reussite.length > 0) {
        builder.addHeading("Indicateurs de reussite", 3);
        v.auto_evaluation_enseignant.indicateurs_reussite.forEach((ind) => {
          builder.addBullet(ind, 8, [5, 150, 105]);
        });
      }
    }
  });

  doc.save(getFileName(result, "pdf"));
}

/** Helper class for building docx Paragraphs and elements safely in memory */
class WordBuilder {
  children: any[] = [];

  addHeading(text: string, size: number, color = "1A56DB", spaceBefore = 240, spaceAfter = 120): void {
    this.children.push(
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            size, // half-points
            color,
            font: "Calibri",
          }),
        ],
        spacing: { before: spaceBefore, after: spaceAfter },
      })
    );
  }

  addText(
    text: string,
    options?: { bold?: boolean; italics?: boolean; size?: number; color?: string; indent?: number }
  ): void {
    this.children.push(
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: options?.bold ?? false,
            italics: options?.italics ?? false,
            size: options?.size ?? 20, // 20 half-points = 10pt
            color: options?.color ?? "1F2937",
            font: "Calibri",
          }),
        ],
        indent: options?.indent ? { left: options.indent } : undefined,
        spacing: { before: 80, after: 80 },
      })
    );
  }

  addBullet(text: string, indent = 360, color = "1F2937"): void {
    this.children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "• " + text,
            color,
            font: "Calibri",
            size: 20,
          }),
        ],
        indent: { left: indent },
        spacing: { before: 60, after: 60 },
      })
    );
  }

  addKeyValue(key: string, value: string): void {
    if (!value) return;
    this.children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: key + " : ",
            bold: true,
            color: "4B5563",
            font: "Calibri",
            size: 20,
          }),
          new TextRun({
            text: value,
            font: "Calibri",
            size: 20,
            color: "1F2937",
          }),
        ],
        spacing: { before: 80, after: 80 },
      })
    );
  }

  addCalloutBox(title: string, lines: string[], borderColor = "1A56DB", bgColor = "F0F9FF"): void {
    const cellChildren: Paragraph[] = [];

    if (title) {
      cellChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              color: borderColor,
              size: 20,
              font: "Calibri",
            }),
          ],
          spacing: { before: 100, after: 100 },
        })
      );
    }

    lines.forEach((l) => {
      cellChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: l,
              size: 19,
              font: "Calibri",
              color: "1F2937",
            }),
          ],
          spacing: { before: 60, after: 60 },
        })
      );
    });

    this.children.push(
      new Table({
        width: {
          size: 100,
          type: "percent" as any,
        },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "auto" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
          right: { style: BorderStyle.NONE, size: 0, color: "auto" },
          left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: cellChildren,
                shading: {
                  fill: bgColor,
                },
                margins: {
                  top: 140,
                  bottom: 140,
                  left: 200,
                  right: 200,
                },
              }),
            ],
          }),
        ],
      })
    );

    // Padding paragraph after table
    this.children.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
      })
    );
  }

  addHorizontalLine(): void {
    this.children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "_________________________________________________________________________________",
            color: "DCDCDC",
          }),
        ],
        spacing: { before: 180, after: 180 },
      })
    );
  }
}

/** Export result as Word document using docx */
export async function exportAsWord(result: SPResult): Promise<void> {
  const builder = new WordBuilder();

  // Sequence Header
  builder.addText("SITUATIONS-PROBLEMES GENEREE", { bold: true, size: 17, color: "6B7280" });
  builder.addHeading(result.sequence || "Séquence", 44, "1A56DB", 200, 200);

  builder.addKeyValue("Module", result.module);
  builder.addKeyValue("Durée estimée", result.duree_estimee || "N/A");

  if (result.savoirs_couverts && result.savoirs_couverts.length > 0) {
    builder.addKeyValue("Savoirs couverts", result.savoirs_couverts.join(", "));
  }

  // Iterate over each variant
  result.variantes?.forEach((v) => {
    builder.addHorizontalLine();
    builder.addHeading(`Variante ${v.numero} : ${v.contexte_theme}`, 32, "1A56DB", 240, 120);

    if (v.titre_sp) {
      builder.addKeyValue("Titre de la SP", v.titre_sp);
    }

    if (v.fil_conducteur) {
      builder.addKeyValue("Fil conducteur", v.fil_conducteur);
    }

    // Lancement multimodal global
    if (v.multimodal_global) {
      builder.addHeading("Lancement multimodal global", 26, "D97706", 200, 100);
      const launchLines: string[] = [];
      if (v.multimodal_global.pitch_oral) {
        launchLines.push(`Pitch oral : "${v.multimodal_global.pitch_oral}"`);
      }
      if (v.multimodal_global.image_declenchante?.description_pedagogique) {
        launchLines.push(
          `Image déclenchante : ${v.multimodal_global.image_declenchante.description_pedagogique} (Mots-clés : ${v.multimodal_global.image_declenchante.mots_cles_unsplash})`
        );
      }
      if (launchLines.length > 0) {
        builder.addCalloutBox("", launchLines, "D97706", "FFFBEB");
      }
    }

    // Paliers d'apprentissage
    if (v.paliers && v.paliers.length > 0) {
      v.paliers.forEach((p) => {
        builder.addHorizontalLine();
        builder.addHeading(`Palier ${p.numero_palier} : ${p.titre_palier}`, 24, "1A56DB", 200, 100);

        if (p.action_kinesthesique) {
          builder.addKeyValue("Action kinesthésique", p.action_kinesthesique);
        }

        // Obstacle épistémologique
        if (p.obstacle_epistemologique) {
          builder.addHeading("Obstacle épistémologique", 22, "D97706", 180, 90);
          const obstacleLines = [
            `Obstacle : ${p.obstacle_epistemologique.formulation}`,
            `Erreur typique : ${p.obstacle_epistemologique.erreur_typique}`,
          ];
          if (p.obstacle_epistemologique.origine_confusion) {
            obstacleLines.push(`Origine : ${p.obstacle_epistemologique.origine_confusion}`);
          }
          if (p.obstacle_epistemologique.contraintes_pedagogiques && p.obstacle_epistemologique.contraintes_pedagogiques.length > 0) {
            obstacleLines.push(`Contraintes : ${p.obstacle_epistemologique.contraintes_pedagogiques.join(", ")}`);
          }
          builder.addCalloutBox("", obstacleLines, "DC2626", "FEF2F2");
        }

        // Situation partielle
        if (p.situation_partielle) {
          builder.addHeading("Situation partielle", 22, "1A56DB", 180, 90);
          const situationLines = [p.situation_partielle.texte, `Tâche finale : ${p.situation_partielle.tache_finale}`];
          builder.addCalloutBox("", situationLines, "1A56DB", "F0F9FF");
        }

        // Questions différenciées
        if (p.questions) {
          builder.addHeading("Questions de guidage différenciées", 22, "1A56DB", 180, 90);
          if (p.questions.consigne_enseignant) {
            builder.addText(`Consigne : ${p.questions.consigne_enseignant}`, {
              bold: true,
              size: 20,
              color: "4B5563",
            });
          }

          const renderQuestions = (title: string, questions?: Question[], prefixColor = "1A56DB") => {
            if (!questions || questions.length === 0) return;
            builder.addHeading(title, 20, "374151", 160, 80);
            questions.forEach((q) => {
              builder.addBullet(`Q${q.numero} [${q.badge}] : ${q.question}`, 360, prefixColor);
              if (q.objectif) {
                builder.addText(`Objectif : ${q.objectif}`, { size: 18, color: "6B7280", indent: 720 });
              }
              if (q.metacognition) {
                builder.addText(`Métacognition : ${q.metacognition}`, { size: 18, color: "6B7280", indent: 720 });
              }
              if (q.indice) {
                builder.addText(`Indice : ${q.indice}`, { size: 18, color: "6B7280", indent: 720 });
              }
              if (q.coups_de_pouce) {
                builder.addText(`N1 Conceptuel : ${q.coups_de_pouce.niveau_1_conceptuel}`, {
                  size: 18,
                  color: "991B1B",
                  indent: 720,
                });
                builder.addText(`N2 Procédural : ${q.coups_de_pouce.niveau_2_procedural}`, {
                  size: 18,
                  color: "991B1B",
                  indent: 720,
                });
              }
            });
          };

          renderQuestions("SOCLE COMMUN - Accessible à tous", p.questions.niveau_socle, "059669");
          renderQuestions("APPROFONDISSEMENT - Conflit cognitif", p.questions.niveau_intermediaire, "D97706");
          renderQuestions("DÉPASSEMENT - Pour aller plus loin", p.questions.niveau_depassement, "7C3AED");

          if (p.questions.criteres_reussite && p.questions.criteres_reussite.length > 0) {
            builder.addHeading("Critères de réussite", 20, "374151", 160, 80);
            p.questions.criteres_reussite.forEach((c) => {
              builder.addBullet(c, 360, "059669");
            });
          }
        }

        // Simulateur de classe
        if (p.simulateur_classe) {
          builder.addHeading("Simulateur de classe", 22, "7C3AED", 180, 90);
          if (p.simulateur_classe.contexte_simulateur) {
            builder.addText(p.simulateur_classe.contexte_simulateur);
          }
          if (p.simulateur_classe.question_cible) {
            builder.addKeyValue("Question cible", p.simulateur_classe.question_cible);
          }

          const renderProfil = (profil: SimulateurProfil, border: string, bg: string) => {
            if (!profil) return;
            const profileLines = [`Réponse simulée : "${profil.reponse_simulee}"`];
            if (profil.erreur_revelee) profileLines.push(`Erreur révélée : ${profil.erreur_revelee}`);
            if (profil.ce_qui_manque) profileLines.push(`Ce qui manque : ${profil.ce_qui_manque}`);
            if (profil.ce_que_cela_revele) profileLines.push(`Ce que ça révèle : ${profil.ce_que_cela_revele}`);
            if (profil.question_relance) profileLines.push(`Question de relance : ${profil.question_relance}`);
            if (profil.comment_canaliser) profileLines.push(`Comment canaliser : ${profil.comment_canaliser}`);
            profileLines.push(`Attitude pédagogique : ${profil.attitude_pedagogique}`);
            if (profil.mission_bonus) profileLines.push(`Mission bonus : ${profil.mission_bonus}`);

            builder.addCalloutBox(`${profil.emoji} ${profil.profil}`, profileLines, border, bg);
          };

          renderProfil(p.simulateur_classe.eleve_difficulte, "DC2626", "FEF2F2");
          renderProfil(p.simulateur_classe.eleve_moyen, "D97706", "FFFBEB");
          renderProfil(p.simulateur_classe.eleve_avance, "1A56DB", "F0F9FF");
        }

        // Mise en oeuvre séance
        if (p.mise_en_oeuvre_seance) {
          builder.addHeading("Mise en œuvre - séance", 22, "1A56DB", 180, 90);
          if (p.mise_en_oeuvre_seance.organisation) {
            builder.addKeyValue("Organisation", p.mise_en_oeuvre_seance.organisation);
          }
          if (p.mise_en_oeuvre_seance.duree_totale) {
            builder.addKeyValue("Durée totale", p.mise_en_oeuvre_seance.duree_totale);
          }

          if (p.mise_en_oeuvre_seance.phases && p.mise_en_oeuvre_seance.phases.length > 0) {
            builder.addHeading("Phases de la séance", 20, "374151", 160, 80);
            p.mise_en_oeuvre_seance.phases.forEach((ph) => {
              builder.addText(`Phase ${ph.numero} : ${ph.nom} (${ph.duree})`, { bold: true, size: 20, color: "1A56DB" });
              builder.addBullet(`Rôle Enseignant : ${ph.role_enseignant}`, 540, "4B5563");
              builder.addBullet(`Rôle Élève : ${ph.role_eleve}`, 540, "4B5563");
              builder.addBullet(`Consigne clé : ${ph.consigne_cle}`, 540, "4B5563");
            });
          }
        }

        // Synthèse tableau palier
        if (p.synthese_tableau_palier) {
          const s = p.synthese_tableau_palier;
          builder.addHeading("Synthèse Notionnelle - Palier", 20, "374151", 160, 80);
          builder.addKeyValue("Notion", s.titre_notion);
          builder.addKeyValue("Définition", s.definition);
          builder.addKeyValue("Règle essentielle", s.regle_essentielle);
          builder.addKeyValue("Exemple de projet", s.exemple_projet);
        }
      });
    }

    // Séance de synthèse finale
    if (v.seance_synthese_finale) {
      builder.addHeading("Synthèse Finale de Séquence", 26, "7C3AED", 200, 100);
      if (v.seance_synthese_finale.titre) {
        builder.addText(v.seance_synthese_finale.titre, { bold: true, size: 22, color: "1F2937" });
      }
      if (v.seance_synthese_finale.contenu) {
        builder.addText(v.seance_synthese_finale.contenu);
      }
      if (v.seance_synthese_finale.tableau) {
        const t = v.seance_synthese_finale.tableau;
        builder.addHeading("Tableau de synthèse finale", 20, "374151", 160, 80);
        builder.addKeyValue("Notion", t.titre_notion);
        builder.addKeyValue("Définition", t.definition);
        builder.addKeyValue("Règle essentielle", t.regle_essentielle);
        builder.addKeyValue("Exemple de projet", t.exemple_projet);
      }
    }

    // Auto-évaluation
    if (v.auto_evaluation_enseignant) {
      builder.addHeading("Auto-évaluation enseignant", 26, "059669", 200, 100);
      if (v.auto_evaluation_enseignant.checklist && v.auto_evaluation_enseignant.checklist.length > 0) {
        builder.addHeading("Checklist de préparation", 22, "374151", 160, 80);
        v.auto_evaluation_enseignant.checklist.forEach((item) => {
          builder.addBullet(`[ ] ${item}`, 360, "9CA3AF");
        });
      }
      if (v.auto_evaluation_enseignant.indicateurs_reussite && v.auto_evaluation_enseignant.indicateurs_reussite.length > 0) {
        builder.addHeading("Indicateurs de réussite", 22, "374151", 160, 80);
        v.auto_evaluation_enseignant.indicateurs_reussite.forEach((ind) => {
          builder.addBullet(ind, 360, "059669");
        });
      }
    }
  });

  const doc = new DocxDocument({
    sections: [
      {
        properties: {},
        children: builder.children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, getFileName(result, "docx"));
}
