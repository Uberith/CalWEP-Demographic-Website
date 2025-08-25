let html2pdfLib;

async function ensureHtml2pdf() {
  if (!html2pdfLib) {
    const mod = await import("html2pdf.js");
    html2pdfLib = mod.default || mod;
  }
  return html2pdfLib;
}

export async function downloadPdf(lastReport) {
  if (!lastReport) return;
  const safe = (lastReport.address || "report")
    .replace(/[^a-z0-9]+/gi, "_")
    .toLowerCase();
  const element = document.querySelector("#result .card");
  if (!element) return;
  const opt = {
    margin: 0.5,
    filename: `calwep_report_${safe}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };
  const html2pdf = await ensureHtml2pdf();
  html2pdf().set(opt).from(element).save();
}
