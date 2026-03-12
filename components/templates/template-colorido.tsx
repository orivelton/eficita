"use client"

import type { Quote } from "@/lib/types"
import { calculateItemTotal, calculateSubtotal, calculateTotalVat, calculateGrandTotal, formatCurrency, formatDate } from "@/lib/quotes"

interface Props { quote: Quote }

export function TemplateColorido({ quote }: Props) {
  const { company, client, items } = quote
  const bc = company.primaryColor || "#1a56db"
  // Derive a softer bg tint
  const bgTint = `${bc}0a`
  const lightTint = `${bc}15`

  return (
    <div id="quote-preview" className="mx-auto text-gray-900" style={{ width: "210mm", minHeight: "297mm", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.5, background: `linear-gradient(180deg, ${bgTint} 0%, #ffffff 40%)` }}>
      <div style={{ padding: "16mm 20mm" }}>
        {/* Header with colored card */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "stretch", gap: "5mm", marginBottom: "8mm" }}>
          {/* Company card */}
          <div style={{ flex: 1, backgroundColor: bc, color: "#ffffff", borderRadius: "4mm", padding: "5mm 6mm", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "3mm", marginBottom: "2mm" }}>
              {company.logo && <img src={company.logo} alt="Logo" style={{ height: "12mm", width: "12mm", objectFit: "contain", borderRadius: "2mm" }} crossOrigin="anonymous" />}
              <h1 style={{ fontSize: "15pt", fontWeight: 800, margin: 0 }}>{company.name || "Empresa"}</h1>
            </div>
            <div style={{ fontSize: "7.5pt", opacity: 0.85, display: "flex", flexWrap: "wrap", gap: "3mm" }}>
              {company.nif && <span>NIF: {company.nif}</span>}
              {company.phone && <span>{company.phone}</span>}
              {company.email && <span>{company.email}</span>}
            </div>
            {company.address && <p style={{ fontSize: "7.5pt", opacity: 0.8, margin: "1mm 0 0" }}>{company.address}</p>}
          </div>
          {/* Quote info card */}
          <div style={{ width: "40%", backgroundColor: lightTint, borderRadius: "4mm", padding: "5mm 6mm", border: `1.5px solid ${bc}25` }}>
            <p style={{ fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.1em", color: bc, fontWeight: 700, margin: "0 0 1.5mm" }}>Orcamento</p>
            <p style={{ fontSize: "16pt", fontWeight: 800, color: bc, margin: "0 0 3mm" }}>{quote.number}</p>
            <div style={{ fontSize: "8pt", color: "#6b7280" }}>
              <p style={{ margin: 0 }}>Data: <strong style={{ color: "#374151" }}>{formatDate(quote.createdAt)}</strong></p>
              <p style={{ margin: "1mm 0 0" }}>Validade: <strong style={{ color: "#374151" }}>{formatDate(quote.validUntil)}</strong></p>
              {quote.projectTitle && <p style={{ margin: "1mm 0 0" }}>Projeto: <strong style={{ color: "#374151" }}>{quote.projectTitle}</strong></p>}
            </div>
          </div>
        </div>

        {/* Client */}
        <div style={{ backgroundColor: lightTint, borderRadius: "3mm", padding: "4mm 5mm", marginBottom: "8mm", border: `1.5px solid ${bc}20` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "7pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: bc, margin: "0 0 1.5mm" }}>Cliente</p>
              <p style={{ fontSize: "11pt", fontWeight: 700, margin: 0, color: "#111827" }}>{client.name || "---"}</p>
              {client.nif && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "1mm 0 0" }}>NIF: {client.nif}</p>}
              {client.address && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "1mm 0 0" }}>{client.address}</p>}
            </div>
            <div style={{ textAlign: "right", fontSize: "8pt", color: "#6b7280" }}>
              {client.phone && <p style={{ margin: "0.5mm 0" }}>{client.phone}</p>}
              {client.email && <p style={{ margin: "0.5mm 0" }}>{client.email}</p>}
              {client.workAddress && <p style={{ margin: "0.5mm 0" }}>Obra: {client.workAddress}</p>}
            </div>
          </div>
        </div>

        {/* Items with colored rows */}
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 1.5mm", marginBottom: "6mm", fontSize: "8.5pt" }}>
          <thead>
            <tr>
              {[{ h: "Servico", a: "left" as const }, { h: "Qtd", a: "center" as const }, { h: "Un.", a: "center" as const }, { h: "P. Unit.", a: "right" as const }, { h: "IVA", a: "center" as const }, { h: "Total", a: "right" as const }].map((c, i) => (
                <th key={c.h} style={{ textAlign: c.a, padding: "2.5mm 2.5mm", fontWeight: 700, fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.04em", color: bc, width: i === 0 ? "auto" : i === 4 ? "8%" : i === 2 ? "8%" : i === 1 ? "10%" : "16%", borderBottom: `2px solid ${bc}` }}>{c.h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? lightTint : "transparent", borderRadius: "2mm" }}>
                <td style={{ padding: "3mm 2.5mm", borderRadius: "2mm 0 0 2mm" }}>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{item.serviceName || "---"}</span>
                  {item.description && <><br /><span style={{ fontSize: "7.5pt", color: "#9ca3af" }}>{item.description}</span></>}
                </td>
                <td style={{ padding: "3mm 2.5mm", textAlign: "center", color: "#374151" }}>{item.quantity}</td>
                <td style={{ padding: "3mm 2.5mm", textAlign: "center", color: "#374151" }}>{item.unit}</td>
                <td style={{ padding: "3mm 2.5mm", textAlign: "right", color: "#374151" }}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ padding: "3mm 2.5mm", textAlign: "center", color: "#374151" }}>{item.vatPercentage}%</td>
                <td style={{ padding: "3mm 2.5mm", textAlign: "right", fontWeight: 700, color: bc, borderRadius: "0 2mm 2mm 0" }}>{formatCurrency(calculateItemTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8mm" }}>
          <div style={{ width: "45%", maxWidth: "220px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2mm 0", fontSize: "9pt", color: "#6b7280" }}><span>Subtotal</span><span style={{ color: "#374151" }}>{formatCurrency(calculateSubtotal(items))}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2mm 0", fontSize: "9pt", color: "#6b7280" }}><span>IVA</span><span style={{ color: "#374151" }}>{formatCurrency(calculateTotalVat(items))}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4mm 5mm", background: `linear-gradient(135deg, ${bc}, ${bc}cc)`, color: "#ffffff", borderRadius: "3mm", marginTop: "3mm", fontSize: "14pt", fontWeight: 800, boxShadow: `0 2mm 8mm ${bc}30` }}>
              <span>Total</span><span>{formatCurrency(calculateGrandTotal(items))}</span>
            </div>
          </div>
        </div>

        {/* IBAN */}
        {company.iban && (
          <div style={{ display: "flex", alignItems: "center", gap: "3mm", padding: "3mm 4mm", backgroundColor: lightTint, borderRadius: "2mm", border: `1px solid ${bc}20`, marginBottom: "4mm" }}>
            <span style={{ backgroundColor: bc, color: "#fff", borderRadius: "1.5mm", padding: "1mm 2.5mm", fontSize: "6.5pt", fontWeight: 700, textTransform: "uppercase" }}>IBAN</span>
            <span style={{ fontFamily: "monospace", fontSize: "9pt", color: "#374151" }}>{company.iban}</span>
          </div>
        )}

        {/* Notes */}
        {quote.notes && (
          <div style={{ backgroundColor: lightTint, border: `1px solid ${bc}20`, borderRadius: "3mm", padding: "4mm 5mm", marginTop: "4mm" }}>
            <p style={{ fontSize: "7pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: bc, margin: "0 0 2mm" }}>Observacoes / Condicoes</p>
            <p style={{ fontSize: "8pt", color: "#374151", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
