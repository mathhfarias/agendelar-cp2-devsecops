const fs = require("fs");

const reportPath = process.argv[2] || "zap-reports/zap-report.json";

if (!fs.existsSync(reportPath)) {
  console.error(`Relatório não encontrado: ${reportPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const alerts = (data.site || []).flatMap((site) => site.alerts || []);

const severities = {
  Informational: 0,
  Low: 0,
  Medium: 0,
  High: 0,
  Critical: 0,
  Unknown: 0
};

function normalizeSeverity(alert) {
  const riskText = String(alert.riskdesc || alert.risk || "").toLowerCase();
  const riskCode = String(alert.riskcode || "");

  if (riskText.includes("critical") || riskCode === "4") return "Critical";
  if (riskText.includes("high") || riskCode === "3") return "High";
  if (riskText.includes("medium") || riskCode === "2") return "Medium";
  if (riskText.includes("low") || riskCode === "1") return "Low";
  if (riskText.includes("informational") || riskText.includes("info") || riskCode === "0") {
    return "Informational";
  }

  return "Unknown";
}

const vulnerabilityTypes = {};

for (const alert of alerts) {
  const severity = normalizeSeverity(alert);
  severities[severity]++;

  const name = alert.name || alert.alert || "Alerta sem nome";
  vulnerabilityTypes[name] = (vulnerabilityTypes[name] || 0) + 1;
}

const sortedTypes = Object.entries(vulnerabilityTypes)
  .sort((a, b) => b[1] - a[1]);

const lines = [];

lines.push("Resumo dos alertas encontrados pelo OWASP ZAP");
lines.push("------------------------------------------------");
lines.push(`Total de alertas: ${alerts.length}`);
lines.push(`Informativos: ${severities.Informational}`);
lines.push(`Baixos: ${severities.Low}`);
lines.push(`Médios: ${severities.Medium}`);
lines.push(`Altos: ${severities.High}`);
lines.push(`Críticos: ${severities.Critical}`);
lines.push("");
lines.push("Tipos de vulnerabilidades mais comuns:");

if (sortedTypes.length === 0) {
  lines.push("Nenhum alerta encontrado.");
} else {
  for (const [type, count] of sortedTypes) {
    lines.push(`${count} - ${type}`);
  }
}

const summary = lines.join("\n");

console.log(summary);

fs.mkdirSync("zap-reports", { recursive: true });
fs.writeFileSync("zap-reports/zap-summary.txt", summary);

if (process.env.GITHUB_ENV) {
  fs.appendFileSync(process.env.GITHUB_ENV, `ZAP_HIGH=${severities.High}\n`);
  fs.appendFileSync(process.env.GITHUB_ENV, `ZAP_CRITICAL=${severities.Critical}\n`);
}