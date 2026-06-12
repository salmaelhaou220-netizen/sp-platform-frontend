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
  BorderStyle,
  WidthType
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
      this.doc.text(cleanedLabel, currentX + paddingX, this.y + paddingY + 1.8);

      currentX += badgeWidth + 3;
    });

    this.y += badgeHeight + 5;
  }

  addCalloutBox(
    title: string,
    lines: string[],
    borderColor: [number, number, number],
    bgColor: [number, number, number]
  ): void {
    const padding = 5;
    const titleHeight = title ? 5 : 0;
    const textWidth = this.contentWidth - padding * 2 - 4;

    const cleanedTitle = cleanText(title);
    let allLines: string[] = [];
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    lines.forEach((l) => {
      if (l) {
        allLines.push(...this.doc.splitTextToSize(cleanText(l), textWidth));
      }
    });

    const neededHeight = titleHeight + allLines.length * this.lineHeight + padding * 2;
    this.checkPageBreak(neededHeight + 4);

    const boxY = this.y;
    const boxHeight = neededHeight;
    const boxWidth = this.contentWidth;

    // Draw background rect
    this.doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    this.doc.rect(this.leftMargin, boxY, boxWidth, boxHeight, "F");

    // Draw left accent border
    this.doc.setFillColor(borderColor[0], borderColor[1], borderColor[2]);
    this.doc.rect(this.leftMargin, boxY, 3, boxHeight, "F");

    let drawY = boxY + padding;

    // Draw title if present
    if (title) {
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9.5);
      this.doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
      this.doc.text(cleanedTitle, this.leftMargin + padding + 3, drawY + 3);
      drawY += titleHeight + 2;
    }

    // Draw lines
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(55, 65, 81);
    allLines.forEach((line) => {
      this.doc.text(line, this.leftMargin + padding + 3, drawY + 3);
      drawY += this.lineHeight;
    });

    this.y = boxY + boxHeight + 4;
  }

  addKeyValue(key: string, value: string): void {
    const cleanedKey = cleanText(key);
    const cleanedValue = cleanText(value);

    this.checkPageBreak();
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(75, 85, 99); // Cool gray

    const keyText = `${cleanedKey} : `;
    const keyWidth = this.doc.getTextWidth(keyText);
    this.doc.text(keyText, this.leftMargin, this.y);

    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(31, 41, 55);

    const valueWidth = this.contentWidth - keyWidth;
    const valueLines = this.doc.splitTextToSize(cleanedValue, valueWidth);

    valueLines.forEach((line: string, index: number) => {
      if (index > 0) {
        this.y += this.lineHeight;
        this.checkPageBreak();
      }
      this.doc.text(line, this.leftMargin + keyWidth, this.y);
    });
    this.y += this.lineHeight + 1;
  }

  addBullet(text: string, indent = 8, prefixColor: [number, number, number] = [26, 86, 219]): void {
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
  if (result.type_sp) {
    const label =
      result.type_sp === "didactique"
        ? "SP Didactique"
        : result.type_sp === "formative"
        ? "SP Formative"
        : "SP Sommative";
    const color: [number, number, number] =
      result.type_sp === "didactique"
        ? [26, 86, 219] // Blue
        : result.type_sp === "formative"
        ? [217, 119, 6] // Amber
        : [220, 38, 38]; // Red
    metadataBadges.push({ text: label, color });
  }
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

    // Lancement multimodal (emojis replaced in headers)
    if (v.multimodal) {
      const launchLines: string[] = [];
      if (v.multimodal.pitch_oral) {
        launchLines.push(`Pitch oral : "${v.multimodal.pitch_oral}"`);
      }
      if (v.multimodal.image_declenchante?.description_pedagogique) {
        launchLines.push(
          `Image declenchante : ${v.multimodal.image_declenchante.description_pedagogique} (Mots-cles : ${v.multimodal.image_declenchante.mots_cles_unsplash})`
        );
      }
      if (v.multimodal.action_kinesthesique) {
        launchLines.push(`Action kinesthesique : ${v.multimodal.action_kinesthesique}`);
      }

      if (launchLines.length > 0) {
        builder.addSectionHeader("Lancement multimodal", [26, 86, 219]);
        builder.addCalloutBox("", launchLines, [217, 119, 6], [255, 251, 235]); // Amber border, Warm bg
      }
    }

    // Obstacle épistémologique
    if (v.obstacle_epistemologique) {
      builder.addSectionHeader("Obstacle epistemologique", [217, 119, 6]);
      const obstacleLines = [
        `Obstacle : ${v.obstacle_epistemologique.formulation}`,
        `Erreur typique : ${v.obstacle_epistemologique.erreur_typique}`,
      ];
      if (v.obstacle_epistemologique.origine_confusion) {
        obstacleLines.push(`Origine : ${v.obstacle_epistemologique.origine_confusion}`);
      }
      if (v.obstacle_epistemologique.contraintes_pedagogiques?.length > 0) {
        obstacleLines.push(`Contraintes : ${v.obstacle_epistemologique.contraintes_pedagogiques.join(", ")}`);
      }
      builder.addCalloutBox("", obstacleLines, [220, 38, 38], [254, 242, 242]); // Red border and light red bg
    }

    // Situation
    if (v.situation) {
      builder.addSectionHeader("La situation-probleme", [26, 86, 219]);
      const situationLines = [v.situation.texte, `Tache finale : ${v.situation.tache_finale}`];
      builder.addCalloutBox("", situationLines, [26, 86, 219], [243, 248, 255]); // Blue border and light blue bg
    }

    // Questions différenciées
    if (v.questions_differenciees) {
      builder.addSectionHeader("Questions de guidage differenciees", [26, 86, 219]);
      if (v.questions_differenciees.consigne_enseignant) {
        builder.addText(`Consigne : ${v.questions_differenciees.consigne_enseignant}`, {
          bold: true,
          size: 9.5,
          color: [107, 114, 128],
        });
        builder.y += 2;
      }

      const renderQuestions = (title: string, questions: Question[], titleColor: [number, number, number]) => {
        if (!questions || questions.length === 0) return;
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

      renderQuestions("SOCLE COMMUN - Accessible a tous", v.questions_differenciees.niveau_socle, [5, 150, 105]);
      renderQuestions(
        "APPROFONDISSEMENT - Conflit cognitif",
        v.questions_differenciees.niveau_intermediaire,
        [217, 119, 6]
      );
      renderQuestions("DEPASSEMENT - Pour aller plus loin", v.questions_differenciees.niveau_depassement, [
        124, 58, 237,
      ]);

      if (v.questions_differenciees.criteres_reussite?.length > 0) {
        builder.addHeading("Criteres de reussite", 3);
        v.questions_differenciees.criteres_reussite.forEach((c) => {
          builder.addBullet(c, 8, [5, 150, 105]);
        });
      }
    }

    // Simulateur de classe
    if (v.simulateur_classe) {
      builder.addSectionHeader("Simulateur de classe", [124, 58, 237]);
      if (v.simulateur_classe.contexte_simulateur) {
        builder.addText(v.simulateur_classe.contexte_simulateur);
        builder.y += 2;
      }
      if (v.simulateur_classe.question_cible) {
        builder.addKeyValue("Question cible", v.simulateur_classe.question_cible);
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

      renderProfil(v.simulateur_classe.eleve_difficulte, [220, 38, 38], [254, 242, 242]); // Red
      renderProfil(v.simulateur_classe.eleve_moyen, [217, 119, 6], [255, 251, 235]); // Amber
      renderProfil(v.simulateur_classe.eleve_avance, [26, 86, 219], [243, 248, 255]); // Blue
    }

    // Mise en oeuvre
    if (v.mise_en_oeuvre_classe) {
      builder.addSectionHeader("Mise en oeuvre en classe", [26, 86, 219]);
      builder.addKeyValue("Organisation", v.mise_en_oeuvre_classe.organisation);
      builder.addKeyValue("Duree totale", v.mise_en_oeuvre_classe.duree_totale);
      builder.y += 2;

      if (v.mise_en_oeuvre_classe.phases?.length > 0) {
        builder.addHeading("Phases de la seance", 3);
        v.mise_en_oeuvre_classe.phases.forEach((p) => {
          builder.addText(`Phase ${p.numero} : ${p.nom} (${p.duree})`, { bold: true, size: 9.5, color: [26, 86, 219] });
          builder.addBullet(`Role Enseignant : ${p.role_enseignant}`, 12, [75, 85, 99]);
          builder.addBullet(`Role Eleve : ${p.role_eleve}`, 12, [75, 85, 99]);
          builder.addBullet(`Consigne cle : ${p.consigne_cle}`, 12, [75, 85, 99]);
          builder.y += 1.5;
        });
      }

      if (v.mise_en_oeuvre_classe.synthese_tableau) {
        const s = v.mise_en_oeuvre_classe.synthese_tableau;
        builder.addSectionHeader("Synthese Notionnelle", [75, 85, 99]);
        builder.addKeyValue("Notion", s.titre_notion);
        builder.addKeyValue("Definition", s.definition);
        builder.addKeyValue("Regle essentielle", s.regle_essentielle);
        builder.addKeyValue("Exemple de projet", s.exemple_projet);
      }
    }

    // Auto-évaluation
    if (v.auto_evaluation_enseignant) {
      builder.addSectionHeader("Auto-evaluation enseignant", [5, 150, 105]);
      if (v.auto_evaluation_enseignant.checklist?.length > 0) {
        builder.addHeading("Checklist de preparation", 3);
        v.auto_evaluation_enseignant.checklist.forEach((item) => {
          builder.addBullet(`[ ] ${item}`, 8, [107, 114, 128]);
        });
        builder.y += 2;
      }
      if (v.auto_evaluation_enseignant.indicateurs_reussite?.length > 0) {
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
            size: options?.size,
            color: options?.color,
            font: "Calibri",
          }),
        ],
        indent: options?.indent ? { left: options.indent } : undefined,
        spacing: { before: 60, after: 60 },
      })
    );
  }

  addKeyValue(key: string, value: string): void {
    this.children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${key} : `,
            bold: true,
            color: "4B5563", // Slate-600
            font: "Calibri",
          }),
          new TextRun({
            text: value,
            color: "1F2937", // Slate-800
            font: "Calibri",
          }),
        ],
        spacing: { before: 60, after: 60 },
      })
    );
  }

  addBullet(text: string, indent = 360, prefixColor = "1A56DB"): void {
    this.children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "•  ",
            bold: true,
            color: prefixColor,
            font: "Calibri",
          }),
          new TextRun({
            text,
            color: "1F2937",
            font: "Calibri",
          }),
        ],
        indent: { left: indent },
        spacing: { before: 40, after: 40 },
      })
    );
  }

  addCalloutBox(title: string, lines: string[], borderColor: string, bgColor: string): void {
    const cellChildren: Paragraph[] = [];
    if (title) {
      cellChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 20, // 10pt
              color: borderColor,
              font: "Calibri",
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }
    lines.forEach((line) => {
      cellChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 19, // 9.5pt
              color: "1F2937",
              font: "Calibri",
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
          type: WidthType.PERCENTAGE,
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
  builder.addKeyValue(
    "Type de SP",
    result.type_sp === "didactique"
      ? "Didactique"
      : result.type_sp === "formative"
      ? "Formative"
      : "Sommative"
  );
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

    // Lancement multimodal
    if (v.multimodal) {
      builder.addHeading("Lancement multimodal", 26, "D97706", 200, 100);
      const launchLines: string[] = [];
      if (v.multimodal.pitch_oral) {
        launchLines.push(`Pitch oral : "${v.multimodal.pitch_oral}"`);
      }
      if (v.multimodal.image_declenchante?.description_pedagogique) {
        launchLines.push(
          `Image déclenchante : ${v.multimodal.image_declenchante.description_pedagogique} (Mots-clés : ${v.multimodal.image_declenchante.mots_cles_unsplash})`
        );
      }
      if (v.multimodal.action_kinesthesique) {
        launchLines.push(`Action kinesthésique : ${v.multimodal.action_kinesthesique}`);
      }
      if (launchLines.length > 0) {
        builder.addCalloutBox("", launchLines, "D97706", "FFFBEB");
      }
    }

    // Obstacle épistémologique
    if (v.obstacle_epistemologique) {
      builder.addHeading("Obstacle épistémologique identifié", 26, "D97706", 200, 100);
      const obstacleLines = [
        `Obstacle : ${v.obstacle_epistemologique.formulation}`,
        `Erreur typique : ${v.obstacle_epistemologique.erreur_typique}`,
      ];
      if (v.obstacle_epistemologique.origine_confusion) {
        obstacleLines.push(`Origine : ${v.obstacle_epistemologique.origine_confusion}`);
      }
      if (v.obstacle_epistemologique.contraintes_pedagogiques?.length > 0) {
        obstacleLines.push(`Contraintes : ${v.obstacle_epistemologique.contraintes_pedagogiques.join(", ")}`);
      }
      builder.addCalloutBox("", obstacleLines, "DC2626", "FEF2F2");
    }

    // Situation
    if (v.situation) {
      builder.addHeading("La situation-problème", 26, "1A56DB", 200, 100);
      const situationLines = [v.situation.texte, `Tâche finale : ${v.situation.tache_finale}`];
      builder.addCalloutBox("", situationLines, "1A56DB", "F0F9FF");
    }

    // Questions différenciées
    if (v.questions_differenciees) {
      builder.addHeading("Questions de guidage différenciées", 26, "1A56DB", 200, 100);
      if (v.questions_differenciees.consigne_enseignant) {
        builder.addText(`Consigne : ${v.questions_differenciees.consigne_enseignant}`, {
          bold: true,
          size: 20,
          color: "4B5563",
        });
      }

      const renderQuestions = (title: string, questions: Question[], prefixColor = "1A56DB") => {
        if (!questions || questions.length === 0) return;
        builder.addHeading(title, 22, "374151", 160, 80);
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

      renderQuestions("SOCLE COMMUN - Accessible à tous", v.questions_differenciees.niveau_socle, "059669");
      renderQuestions("APPROFONDISSEMENT - Conflit cognitif", v.questions_differenciees.niveau_intermediaire, "D97706");
      renderQuestions("DÉPASSEMENT - Pour aller plus loin", v.questions_differenciees.niveau_depassement, "7C3AED");

      if (v.questions_differenciees.criteres_reussite?.length > 0) {
        builder.addHeading("Critères de réussite", 22, "374151", 160, 80);
        v.questions_differenciees.criteres_reussite.forEach((c) => {
          builder.addBullet(c, 360, "059669");
        });
      }
    }

    // Simulateur de classe
    if (v.simulateur_classe) {
      builder.addHeading("Simulateur de classe", 26, "7C3AED", 200, 100);
      if (v.simulateur_classe.contexte_simulateur) {
        builder.addText(v.simulateur_classe.contexte_simulateur);
      }
      if (v.simulateur_classe.question_cible) {
        builder.addKeyValue("Question cible", v.simulateur_classe.question_cible);
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

      renderProfil(v.simulateur_classe.eleve_difficulte, "DC2626", "FEF2F2");
      renderProfil(v.simulateur_classe.eleve_moyen, "D97706", "FFFBEB");
      renderProfil(v.simulateur_classe.eleve_avance, "1A56DB", "F0F9FF");
    }

    // Mise en oeuvre
    if (v.mise_en_oeuvre_classe) {
      builder.addHeading("Mise en œuvre en classe", 26, "1A56DB", 200, 100);
      builder.addKeyValue("Organisation", v.mise_en_oeuvre_classe.organisation);
      builder.addKeyValue("Durée totale", v.mise_en_oeuvre_classe.duree_totale);

      if (v.mise_en_oeuvre_classe.phases?.length > 0) {
        builder.addHeading("Phases de la séance", 22, "374151", 160, 80);
        v.mise_en_oeuvre_classe.phases.forEach((p) => {
          builder.addText(`Phase ${p.numero} : ${p.nom} (${p.duree})`, { bold: true, size: 20, color: "1A56DB" });
          builder.addBullet(`Rôle Enseignant : ${p.role_enseignant}`, 540, "4B5563");
          builder.addBullet(`Rôle Élève : ${p.role_eleve}`, 540, "4B5563");
          builder.addBullet(`Consigne clé : ${p.consigne_cle}`, 540, "4B5563");
        });
      }

      if (v.mise_en_oeuvre_classe.synthese_tableau) {
        const s = v.mise_en_oeuvre_classe.synthese_tableau;
        builder.addHeading("Synthèse Notionnelle", 22, "374151", 160, 80);
        builder.addKeyValue("Notion", s.titre_notion);
        builder.addKeyValue("Définition", s.definition);
        builder.addKeyValue("Règle essentielle", s.regle_essentielle);
        builder.addKeyValue("Exemple de projet", s.exemple_projet);
      }
    }

    // Auto-évaluation
    if (v.auto_evaluation_enseignant) {
      builder.addHeading("Auto-évaluation enseignant", 26, "059669", 200, 100);
      if (v.auto_evaluation_enseignant.checklist?.length > 0) {
        builder.addHeading("Checklist de préparation", 22, "374151", 160, 80);
        v.auto_evaluation_enseignant.checklist.forEach((item) => {
          builder.addBullet(`[ ] ${item}`, 360, "9CA3AF");
        });
      }
      if (v.auto_evaluation_enseignant.indicateurs_reussite?.length > 0) {
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
