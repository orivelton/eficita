"use client"

import type { Quote } from "@/lib/types"
import { calculateItemTotal, calculateSubtotal, calculateTotalVat, calculateGrandTotal, formatCurrency, formatDate } from "@/lib/quotes"

interface Props { quote: Quote }

export function TemplateExecutivo({ quote }: Props) {
  const { company, client, items } = quote
  const bc = company.primaryColor || "#1a56db"

  return (
    <div id="quote-preview" className="mx-auto bg-white text-gray-900" style={{ width: "210mm", minHeight: "297mm", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.5 }}>
      {/* Dark header band */}
      <div style={{ backgroundColor: "#111827", color: "#ffffff", padding: "12mm 20mm 10mm", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "3mm", marginBottom: "3mm" }}>
            {company.logo && <img src={company.logo} alt="Logo" style={{ height: "14mm", width: "14mm", objectFit: "contain", borderRadius: "2mm" }} crossOrigin="anonymous" />}
            <h1 style={{ fontSize: "18pt", fontWeight: 700, margin: 0, color: "#ffffff" }}>{company.name || "Empresa"}</h1>
          </div>
          <div style={{ fontSize: "8pt", color: "#9ca3af", display: "flex", gap: "4mm", flexWrap: "wrap" }}>
            {company.nif && <span>NIF: {company.nif}</span>}
            {company.address && <span>{company.address}</span>}
            {company.phone && <span>{company.phone}</span>}
            {company.email && <span>{company.email}</span>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7280", margin: "0 0 1mm" }}>Proposta Comercial</p>
          <p style={{ fontSize: "16pt", fontWeight: 800, color: bc, margin: 0 }}>{quote.number}</p>
        </div>
      </div>

      {/* Accent bar */}
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${bc}, ${bc}40)` }} />

      <div style={{ padding: "10mm 20mm 16mm" }}>
        {/* Date + Client row */}
        <div style={{ display: "flex", gap: "8mm", marginBottom: "10mm" }}>
          <div style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: "2mm", padding: "4mm 5mm" }}>
            <p style={{ fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", margin: "0 0 1.5mm", fontWeight: 600 }}>Cliente</p>
            <p style={{ fontSize: "11pt", fontWeight: 700, margin: 0, color: "#111827" }}>{client.name || "---"}</p>
            {client.nif && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "1mm 0 0" }}>NIF: {client.nif}</p>}
            {client.address && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "1mm 0 0" }}>{client.address}</p>}
            <div style={{ display: "flex", gap: "4mm", marginTop: "1mm" }}>
              {client.phone && <p style={{ fontSize: "8pt", color: "#6b7280", margin: 0 }}>{client.phone}</p>}
              {client.email && <p style={{ fontSize: "8pt", color: "#6b7280", margin: 0 }}>{client.email}</p>}
            </div>
          </div>
          <div style={{ width: "35%", display: "flex", flexDirection: "column", gap: "2mm" }}>
            {[
              { l: "Data", v: formatDate(quote.createdAt) },
              { l: "Validade", v: formatDate(quote.validUntil) },
              ...(quote.projectTitle ? [{ l: "Projeto", v: quote.projectTitle }] : []),
              ...(client.workAddress ? [{ l: "Obra", v: client.workAddress }] : []),
            ].map((r) => (
              <div key={r.l} style={{ display: "flex", justifyContent: "space-between", fontSize: "8pt", padding: "1.5mm 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: "#9ca3af", fontWeight: 600 }}>{r.l}</span>
                <span style={{ color: "#374151", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6mm", fontSize: "8.5pt" }}>
          <thead>
            <tr style={{ backgroundColor: "#111827", color: "#ffffff" }}>
              {[{ h: "Servico", a: "left" as const }, { h: "Qtd", a: "center" as const }, { h: "Un.", a: "center" as const }, { h: "P. Unit.", a: "right" as const }, { h: "IVA", a: "center" as const }, { h: "Total", a: "right" as const }].map((c, i) => (
                <th key={c.h} style={{ textAlign: c.a, padding: "3mm 2.5mm", fontWeight: 600, fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.04em", width: i === 0 ? "auto" : i === 4 ? "8%" : i === 2 ? "8%" : i === 1 ? "10%" : "16%" }}>{c.h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} style={{ backgroundColor: i % 2 !== 0 ? "#fafafa" : "transparent" }}>
                <td style={{ padding: "3mm 2.5mm", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{item.serviceName || "---"}</span>
                  {item.description && <><br /><span style={{ fontSize: "7.5pt", color: "#9ca3af" }}>{item.description}</span></>}
                </td>
                <td style={{ padding: "3mm 2.5mm", textAlign: "center", borderBottom: "1px solid #f3f4f6", color: "#374151" }}>{item.quantity}</td>
                <td style={{ padding: "3mm 2.5mm", textAlign: "center", borderBottom: "1px solid #f3f4f6", color: "#374151" }}>{item.unit}</td>
                <td style={{ padding: "3mm 2.5mm", textAlign: "right", borderBottom: "1px solid #f3f4f6", color: "#374151" }}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ padding: "3mm 2.5mm", textAlign: "center", borderBottom: "1px solid #f3f4f6", color: "#374151" }}>{item.vatPercentage}%</td>
                <td style={{ padding: "3mm 2.5mm", textAlign: "right", borderBottom: "1px solid #f3f4f6", fontWeight: 700, color: "#111827" }}>{formatCurrency(calculateItemTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8mm" }}>
          <div style={{ width: "45%", maxWidth: "210px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2mm 0", fontSize: "9pt", color: "#6b7280" }}><span>Subtotal</span><span style={{ color: "#374151" }}>{formatCurrency(calculateSubtotal(items))}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2mm 0", fontSize: "9pt", color: "#6b7280" }}><span>IVA</span><span style={{ color: "#374151" }}>{formatCurrency(calculateTotalVat(items))}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3.5mm 5mm", backgroundColor: "#111827", color: "#ffffff", borderRadius: "2mm", marginTop: "2mm", fontSize: "13pt" }}>
              <span style={{ fontWeight: 600 }}>Total</span><span style={{ fontWeight: 800, color: bc }}>{formatCurrency(calculateGrandTotal(items))}</span>
            </div>
          </div>
        </div>

        {/* IBAN */}
        {company.iban && (
          <div style={{ display: "flex", alignItems: "center", gap: "2mm", padding: "3mm 4mm", backgroundColor: "#f9fafb", borderRadius: "2mm", marginBottom: "4mm", fontSize: "8.5pt" }}>
            <span style={{ fontWeight: 600, color: "#9ca3af", fontSize: "7pt", textTransform: "uppercase" }}>IBAN</span>
            <span style={{ fontFamily: "monospace", color: "#374151" }}>{company.iban}</span>
          </div>
        )}

        {/* Notes */}
        {quote.notes && (
          <div style={{ borderTop: "2px solid #111827", paddingTop: "4mm", marginTop: "4mm" }}>
            <p style={{ fontSize: "7pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#111827", margin: "0 0 2mm" }}>Observacoes / Condicoes</p>
            <p style={{ fontSize: "8pt", color: "#374151", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
