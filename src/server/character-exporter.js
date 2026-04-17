import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  convertInchesToTwip,
  BorderStyle
} from "docx";
import fs from "fs";

export async function exportCharacterToWord(draft, preview, filename) {
  try {
    const doc = buildCharacterDocument(draft, preview);
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filename, buffer);
    return filename;
  } catch (error) {
    console.error("Error exporting character to Word:", error);
    throw error;
  }
}

function buildCharacterDocument(draft, preview) {
  const summary = preview.summary;
  const name = draft.name || "Personaje Sin Nombre";
  const race = summary.race?.name || "Raza desconocida";
  const lunarChoice = draft.lunarChoice || "";
  const lunarLabel = lunarChoice === "azul" ? "Luna Azul" : lunarChoice === "roja" ? "Luna Roja" : "Sin elegir";
  
  const health = summary.derived?.health || 0;
  const attributes = summary.attributes?.final || {};
  const generalVirtues = summary.generalVirtues?.selected || {};
  const lunarVirtues = summary.lunarVirtues?.selectedItems || [];
  const dotes = summary.dotes?.selectedItems || [];
  const equipment = summary.equipment;
  const creationHealth = summary.creationHealth;

  const children = [];

  // Encabezado
  children.push(createHeading("FICHA DE PERSONAJE - KEPLER 282C"));

  // Información básica
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Nombre: ${name}`, bold: true })],
      spacing: { before: 100, after: 50 }
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Raza: ${race}`, bold: true })],
      spacing: { after: 50 }
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Luna: ${lunarLabel}`, bold: true })],
      spacing: { after: 200 }
    })
  );

  // Atributos
  children.push(...createAttributesSection(attributes));

  // Salud
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `SALUD: ${health}`, bold: true, size: 24 })],
      spacing: { before: 200, after: 100 }
    })
  );
  children.push(
    new Paragraph({
      text: `Base: ${creationHealth?.initialValue || 0}, Dado: ${creationHealth?.value || 0}, Re-rolls usados: ${creationHealth?.rerollsUsed || 0}`,
      spacing: { after: 200 }
    })
  );

  // Virtudes Generales
  children.push(...createGeneralVirtuesSection(generalVirtues));

  // Virtudes Lunares
  children.push(...createLunarVirtuesSection(lunarVirtues));

  // Dotes
  children.push(...createDotesSection(dotes));

  // Equipo
  children.push(...createEquipmentSection(equipment, draft));

  // Notas
  if (draft.notes) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "NOTAS", bold: true, size: 24 })],
        spacing: { before: 200, after: 100 }
      })
    );
    children.push(
      new Paragraph({
        text: draft.notes,
        spacing: { after: 200 }
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margins: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75)
            }
          }
        },
        children: children
      }
    ]
  });
}

function createHeading(text) {
  return new Paragraph({
    text: text,
    bold: true,
    size: 32,
    spacing: { before: 0, after: 200 },
    alignment: AlignmentType.CENTER,
    border: {
      bottom: {
        color: "000000",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 12
      }
    }
  });
}

function createAttributesSection(attributes) {
  const attrs = [
    { key: "FIS", label: "Físico" },
    { key: "MEN", label: "Mental" },
    { key: "ESP", label: "Espiritual" },
    { key: "ARC", label: "Arcano" }
  ];

  const result = [
    new Paragraph({
      children: [new TextRun({ text: "ATRIBUTOS", bold: true, size: 24 })],
      spacing: { before: 200, after: 100 }
    })
  ];

  attrs.forEach((attr) => {
    result.push(
      new Paragraph({
        text: `${attr.label}: ${attributes[attr.key] || 0}`,
        spacing: { before: 50, after: 50 }
      })
    );
  });

  return result;
}

function createGeneralVirtuesSection(virtues) {
  const result = [
    new Paragraph({
      children: [new TextRun({ text: "VIRTUDES GENERALES (TÉCNICA / ERUDICIÓN / DOMINIO)", bold: true, size: 24 })],
      spacing: { before: 200, after: 100 }
    })
  ];

  if (Object.keys(virtues).length === 0) {
    result.push(
      new Paragraph({
        text: "Sin virtudes generales asignadas",
        italics: true
      })
    );
  } else {
    Object.entries(virtues).forEach(([id, value]) => {
      result.push(
        new Paragraph({
          text: `${id}: ${value}`,
          spacing: { before: 50, after: 50 }
        })
      );
    });
  }

  return result;
}

function createLunarVirtuesSection(virtues) {
  const result = [
    new Paragraph({
      children: [new TextRun({ text: "VIRTUDES LUNARES", bold: true, size: 24 })],
      spacing: { before: 200, after: 100 }
    })
  ];

  if (virtues.length === 0) {
    result.push(
      new Paragraph({
        text: "Sin virtudes lunares asignadas",
        italics: true
      })
    );
  } else {
    virtues.forEach((item) => {
      result.push(
        new Paragraph({
          text: `• ${item.name}`,
          spacing: { before: 50, after: 50 }
        })
      );
    });
  }

  return result;
}

function createDotesSection(dotes) {
  const result = [
    new Paragraph({
      children: [new TextRun({ text: "DOTES", bold: true, size: 24 })],
      spacing: { before: 200, after: 100 }
    })
  ];

  if (dotes.length === 0) {
    result.push(
      new Paragraph({
        text: "Sin dotes asignados",
        italics: true
      })
    );
  } else {
    dotes.forEach((item) => {
      result.push(
        new Paragraph({
          text: `• ${item.name}`,
          spacing: { before: 50, after: 50 }
        })
      );
    });
  }

  return result;
}

function createEquipmentSection(equipment, draft) {
  const result = [
    new Paragraph({
      children: [new TextRun({ text: "EQUIPO", bold: true, size: 24 })],
      spacing: { before: 200, after: 100 }
    })
  ];

  const offensiveLabel = 
    draft.offensiveOrientation === "magic" ? "Canalización" : 
    draft.offensiveOrientation === "performance" ? "Instrumento" : 
    "Arma";
  const defensiveLabel = draft.defensiveOrientation === "resistance" ? "Resistencia" : "Esquiva";

  if (equipment?.offensive?.primary?.item?.name) {
    result.push(
      new Paragraph({
        text: `${offensiveLabel}: ${equipment.offensive.primary.item.name}`,
        spacing: { before: 50, after: 50 }
      })
    );
  }

  if (equipment?.defensive?.armor?.item?.name) {
    result.push(
      new Paragraph({
        text: `Armadura (${defensiveLabel}): ${equipment.defensive.armor.item.name}`,
        spacing: { before: 50, after: 50 }
      })
    );
  }

  if (equipment?.defensive?.shield?.item?.name) {
    result.push(
      new Paragraph({
        text: `Escudo (${defensiveLabel}): ${equipment.defensive.shield.item.name}`,
        spacing: { before: 50, after: 50 }
      })
    );
  }

  return result;
}
