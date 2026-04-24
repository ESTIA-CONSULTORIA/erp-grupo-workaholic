// =======================
// TEMPLATES LEGALES
// =======================

const LEGAL_TEMPLATES: Record<string, string> = {
  CARTA_TRABAJO: `
Por medio del presente, {{companyName}} hace constar que {{employeeName}},
con RFC {{rfc}}, labora en esta empresa desde el {{startDate}}
desempeñando el puesto de {{position}} con un salario mensual de {{salary}}.

Se expide la presente a petición del interesado el día {{today}}.
`,

  FINIQUITO: `
En {{city}}, a {{today}}, comparecen {{companyName}} y {{employeeName}}
para celebrar el presente finiquito.

El trabajador declara haber recibido la cantidad de {{amount}}
por concepto de:
- Salarios pendientes
- Vacaciones
- Prima vacacional
- Aguinaldo proporcional

Manifestando no tener adeudo pendiente con la empresa.

Firma de conformidad.
`,

  RENUNCIA: `
Yo, {{employeeName}}, por medio de la presente manifiesto mi voluntad
de dar por terminada la relación laboral con {{companyName}} a partir del {{terminationDate}}.

Declaro que no existe presión alguna para tomar esta decisión.

Atentamente.
`,

  ACTA_ADMINISTRATIVA: `
En {{city}}, a {{today}}, se levanta la presente acta administrativa
a {{employeeName}} por los siguientes hechos:

{{facts}}

Se deja constancia para los efectos legales correspondientes.
`,
};

// =======================
// FUNCIÓN DE RENDER
// =======================

export function renderTemplate(
  template: string,
  data: Record<string, any>
): string {
  return template.replace(/{{\s*(.*?)\s*}}/g, (_, key) => {
    return data[key] ?? '';
  });
}

// =======================
// EJEMPLO DE USO
// =======================

export function generateLegalDocument(type: string, data: any) {
  const template = LEGAL_TEMPLATES[type];

  if (!template) {
    throw new Error(`Template no encontrado: ${type}`);
  }

  return renderTemplate(template, data);
}
