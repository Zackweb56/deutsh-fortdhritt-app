import { ModuleData } from "@/types/exam";

/**
 * Calculates raw points for a module based on user answers
 */
export const calculateRawPoints = (moduleId: string, moduleData: ModuleData, allAnswers: Record<string, any>): number => {
  let rawPoints = 0;

  // Iterate through parts (teil1, teil2, etc.)
  Object.keys(moduleData).forEach((key) => {
    if (key.startsWith('teil') || key.startsWith('aufgabe')) {
      const teil = moduleData[key];
      const teilId = key.replace('teil', '').replace('aufgabe', '');
      const answers = allAnswers[`${moduleId}_${teilId}`] || {};

      if (teil.type === 'richtig_falsch' || teil.type === 'ja_nein' || teil.type === 'mehrfachauswahl' || teil.type === 'zuordnung_person' || teil.type === 'zuordnung_ueberschrift' || teil.type === 'zuordnung_satz_luecke') {
        const items = teil.items || teil.situations || [];
        items.forEach((item: any) => {
          if (item.isExample) return;
          if (answers[item.id] === item.correct) {
            rawPoints++;
          }
        });

        if (teil.texts) {
          teil.texts.forEach((text: any) => {
            const textItems = text.items || [];
            textItems.forEach((item: any) => {
              if (answers[item.id] === item.correct) {
                rawPoints++;
              }
            });
          });
        }
      } else if (teil.type === 'richtig_falsch_mehrfachauswahl') {
        if (teil.audioTexts) {
          teil.audioTexts.forEach((text: any) => {
            text.items.forEach((item: any) => {
              if (answers[item.id] === item.correct) {
                rawPoints++;
              }
            });
          });
        } else if (teil.texts) {
          teil.texts.forEach((text: any) => {
            if (answers[text.q1.id] === text.q1.correct) rawPoints++;
            if (answers[text.q2.id] === text.q2.correct) rawPoints++;
          });
        }
      } else if (teil.type === 'zuordnung') {
        if (teil.situations) {
          teil.situations.forEach((sit: any) => {
            if (sit.isExample) return;
            if (answers[sit.id] === sit.correct) {
              rawPoints++;
            }
          });
        }
      }
      // Note: freitext (Schreiben) and Sprechen are self-scored or marked by tutor in real life,
      // but here we might just give 0 or a placeholder until implemented.
    }
  });

  return rawPoints;
};

/**
 * Converts raw points to a 0-100 score based on the scoring formula
 */
export const convertToFinalScore = (rawPoints: number, formula: string): number => {
  try {
    // Basic evaluation of formula (e.g., "rawPoints / 30 * 100")
    // We replace 'rawPoints' with the actual value and use Function constructor for safety
    // in this controlled environment where formula comes from our own JSON.
    const sanitizedFormula = formula.replace(/rawPoints/g, rawPoints.toString());
    // eslint-disable-next-line no-new-func
    const score = new Function(`return ${sanitizedFormula}`)();
    return Math.round(score);
  } catch (error) {
    console.error("Error calculating final score:", error);
    return 0;
  }
};
