"use client"

import type { Quote } from "@/lib/types"
import {
  calculateItemTotal,
  calculateSubtotal,
  calculateTotalVat,
  calculateGrandTotal,
  formatCurrency,
  formatDate,
} from "@/lib/quotes"

interface Props { quote: Quote }

export function TemplateClassico({ quote }: Props) {
  const { company, client, items } = quote
  const bc = company.primaryColor || "#1a56db"

  return (
    <div
      id="quote-preview"
      className="mx-auto bg-white text-gray-900"
      style={{ width: "210mm", minHeight: "297mm", padding: "20mm", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.5 }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8mm", paddingBottom: "6mm", borderBottom: `2px solid ${bc}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4mm" }}>
          {company.logo && <img src={company.logo} alt="Logo" style={{ height: "16mm", width: "16mm", objectFit: "contain" }} crossOrigin="anonymous" />}
          <div>
            <h1 style={{ fontSize: "16pt", fontWeight: 700, color: bc, margin: 0 }}>{company.name || "Empresa"}</h1>
            {company.nif && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "1mm 0 0" }}>NIF: {company.nif}</p>}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "8pt", color: "#6b7280" }}>
          {company.address && <p style={{ margin: 0 }}>{company.address}</p>}
          {company.phone && <p style={{ margin: "0.5mm 0 0" }}>{company.phone}</p>}
          {company.email && <p style={{ margin: "0.5mm 0 0" }}>{company.email}</p>}
          {company.iban && <p style={{ margin: "0.5mm 0 0", fontFamily: "monospace", fontSize: "7pt" }}>IBAN: {company.iban}</p>}
        </div>
      </div>

      {/* Title + meta */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8mm" }}>
        <div>
          <h2 style={{ fontSize: "18pt", fontWeight: 700, margin: 0, color: "#111827" }}>ORCAMENTO</h2>
          <p style={{ fontSize: "11pt", color: bc, fontWeight: 600, margin: "1mm 0 0" }}>{quote.number}</p>
          {quote.projectTitle && <p style={{ fontSize: "9pt", color: "#6b7280", margin: "2mm 0 0" }}>Projeto: {quote.projectTitle}</p>}
        </div>
        <div style={{ textAlign: "right", fontSize: "8pt", color: "#6b7280" }}>
          <p style={{ margin: 0 }}><strong style={{ color: "#374151" }}>Data:</strong> {formatDate(quote.createdAt)}</p>
          <p style={{ margin: "1mm 0 0" }}><strong style={{ color: "#374151" }}>Validade:</strong> {formatDate(quote.validUntil)}</p>
        </div>
      </div>

      {/* Client */}
      <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "2mm", padding: "4mm", marginBottom: "8mm" }}>
        <p style={{ fontSize: "7pt", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", margin: "0 0 2mm" }}>Cliente</p>
        <p style={{ fontSize: "11pt", fontWeight: 600, margin: 0, color: "#111827" }}>{client.name || "---"}</p>
        {client.nif && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "1mm 0 0" }}>NIF: {client.nif}</p>}
        {client.address && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "1mm 0 0" }}>{client.address}</p>}
        {client.workAddress && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "1mm 0 0" }}>Morada da obra: {client.workAddress}</p>}
        <div style={{ display: "flex", gap: "6mm", marginTop: "1mm" }}>
          {client.phone && <p style={{ fontSize: "8pt", color: "#6b7280", margin: 0 }}>{client.phone}</p>}
          {client.email && <p style={{ fontSize: "8pt", color: "#6b7280", margin: 0 }}>{client.email}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6mm", fontSize: "8.5pt" }}>
        <thead>
          <tr>
            {["Servico", "Qtd", "Un.", "Preco Un.", "IVA", "Total"].map((h, i) => (
              <th key={h} style={{ textAlign: i === 0 ? "left" : i < 3 ? "center" : "right", padding: "2.5mm 2mm", borderBottom: `1.5px solid ${bc}`, fontWeight: 600, fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.04em", color: bc, width: i === 0 ? "auto" : i === 4 ? "8%" : i === 2 ? "10%" : i === 1 ? "12%" : "16%" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? "transparent" : "#f9fafb" }}>
              <td style={{ padding: "2.5mm 2mm", borderBottom: "0.5px solid #e5e7eb" }}>
                <span style={{ fontWeight: 500, color: "#111827" }}>{item.serviceName || "---"}</span>
                {item.description && <><br /><span style={{ fontSize: "7.5pt", color: "#9ca3af" }}>{item.description}</span></>}
              </td>
              <td style={{ padding: "2.5mm 2mm", textAlign: "center", borderBottom: "0.5px solid #e5e7eb", color: "#374151" }}>{item.quantity}</td>
              <td style={{ padding: "2.5mm 2mm", textAlign: "center", borderBottom: "0.5px solid #e5e7eb", color: "#374151" }}>{item.unit}</td>
              <td style={{ padding: "2.5mm 2mm", textAlign: "right", borderBottom: "0.5px solid #e5e7eb", color: "#374151" }}>{formatCurrency(item.unitPrice)}</td>
              <td style={{ padding: "2.5mm 2mm", textAlign: "center", borderBottom: "0.5px solid #e5e7eb", color: "#374151" }}>{item.vatPercentage}%</td>
              <td style={{ padding: "2.5mm 2mm", textAlign: "right", borderBottom: "0.5px solid #e5e7eb", fontWeight: 600, color: "#111827" }}>{formatCurrency(calculateItemTotal(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8mm" }}>
        <div style={{ width: "50%", maxWidth: "220px" }}>
          {[{ l: "Subtotal", v: calculateSubtotal(items) }, { l: "IVA", v: calculateTotalVat(items) }].map((r) => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "1.5mm 0", fontSize: "9pt", color: "#6b7280" }}>
              <span>{r.l}</span><span style={{ fontWeight: 500, color: "#374151" }}>{formatCurrency(r.v)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3mm 0 0", borderTop: `2px solid ${bc}`, marginTop: "2mm", fontSize: "12pt" }}>
            <span style={{ fontWeight: 700, color: "#111827" }}>Total</span>
            <span style={{ fontWeight: 700, color: bc }}>{formatCurrency(calculateGrandTotal(items))}</span>
          </div>
        </div>
      </div>

      {/* IBAN */}
      {company.iban && (
        <div style={{ backgroundColor: "#f0f4ff", border: `1px solid ${bc}20`, borderRadius: "2mm", padding: "3mm 4mm", marginBottom: "4mm" }}>
          <p style={{ fontSize: "7pt", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", margin: "0 0 1.5mm" }}>Dados de Pagamento</p>
          <p style={{ fontSize: "9pt", color: "#374151", margin: 0, fontFamily: "monospace", letterSpacing: "0.03em" }}><strong>IBAN:</strong> {company.iban}</p>
        </div>
      )}

      {/* Notes */}
      {quote.notes && (
        <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "2mm", padding: "4mm", marginTop: "4mm" }}>
          <p style={{ fontSize: "7pt", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", margin: "0 0 2mm" }}>Observacoes / Condicoes</p>
          <p style={{ fontSize: "8pt", color: "#374151", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{quote.notes}</p>
        </div>
      )}
    </div>
  )
}
