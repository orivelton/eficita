"use client"

import type { Quote } from "@/lib/types"
import { calculateItemTotal, calculateSubtotal, calculateTotalVat, calculateGrandTotal, formatCurrency, formatDate } from "@/lib/quotes"

interface Props { quote: Quote }

export function TemplateModerno({ quote }: Props) {
  const { company, client, items } = quote
  const bc = company.primaryColor || "#1a56db"

  return (
    <div id="quote-preview" className="mx-auto bg-white text-gray-900" style={{ width: "210mm", minHeight: "297mm", fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.5, display: "flex" }}>
      {/* Left accent bar */}
      <div style={{ width: "8mm", backgroundColor: bc, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: "16mm 18mm 16mm 14mm" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10mm" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
              {company.logo && <img src={company.logo} alt="Logo" style={{ height: "14mm", width: "14mm", objectFit: "contain" }} crossOrigin="anonymous" />}
              <h1 style={{ fontSize: "20pt", fontWeight: 800, color: bc, margin: 0, letterSpacing: "-0.02em" }}>{company.name || "Empresa"}</h1>
            </div>
            {company.nif && <p style={{ fontSize: "8pt", color: "#9ca3af", margin: "2mm 0 0" }}>NIF {company.nif}</p>}
          </div>
          <div style={{ textAlign: "right", fontSize: "8pt", color: "#6b7280" }}>
            {company.address && <p style={{ margin: 0 }}>{company.address}</p>}
            {company.phone && <p style={{ margin: "0.5mm 0 0" }}>{company.phone}</p>}
            {company.email && <p style={{ margin: "0.5mm 0 0" }}>{company.email}</p>}
          </div>
        </div>

        {/* Quote number banner */}
        <div style={{ backgroundColor: bc, color: "#fff", borderRadius: "3mm", padding: "5mm 6mm", marginBottom: "8mm", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.8, margin: 0 }}>Proposta</p>
            <p style={{ fontSize: "16pt", fontWeight: 800, margin: "1mm 0 0", letterSpacing: "-0.01em" }}>{quote.number}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "8pt", opacity: 0.8, margin: 0 }}>Data: {formatDate(quote.createdAt)}</p>
            <p style={{ fontSize: "8pt", opacity: 0.8, margin: "1mm 0 0" }}>Validade: {formatDate(quote.validUntil)}</p>
          </div>
        </div>

        {/* Client + Project */}
        <div style={{ display: "flex", gap: "6mm", marginBottom: "8mm" }}>
          <div style={{ flex: 1, border: `1.5px solid ${bc}30`, borderRadius: "2mm", padding: "4mm" }}>
            <p style={{ fontSize: "7pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: bc, margin: "0 0 2mm" }}>Cliente</p>
            <p style={{ fontSize: "11pt", fontWeight: 700, margin: 0, color: "#111827" }}>{client.name || "---"}</p>
            {client.nif && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "1mm 0 0" }}>NIF: {client.nif}</p>}
            {client.address && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "1mm 0 0" }}>{client.address}</p>}
            <div style={{ display: "flex", gap: "4mm", marginTop: "1mm" }}>
              {client.phone && <p style={{ fontSize: "8pt", color: "#6b7280", margin: 0 }}>{client.phone}</p>}
              {client.email && <p style={{ fontSize: "8pt", color: "#6b7280", margin: 0 }}>{client.email}</p>}
            </div>
          </div>
          {quote.projectTitle && (
            <div style={{ width: "40%", border: `1.5px solid ${bc}30`, borderRadius: "2mm", padding: "4mm" }}>
              <p style={{ fontSize: "7pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: bc, margin: "0 0 2mm" }}>Projeto</p>
              <p style={{ fontSize: "10pt", fontWeight: 600, color: "#111827", margin: 0 }}>{quote.projectTitle}</p>
              {client.workAddress && <p style={{ fontSize: "8pt", color: "#6b7280", margin: "2mm 0 0" }}>{client.workAddress}</p>}
            </div>
          )}
        </div>

        {/* Items */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6mm", fontSize: "8.5pt" }}>
          <thead>
            <tr style={{ backgroundColor: `${bc}08` }}>
              {["Servico", "Qtd", "Un.", "P. Unit.", "IVA", "Total"].map((h, i) => (
                <th key={h} style={{ textAlign: i === 0 ? "left" : i < 3 ? "center" : "right", padding: "3mm 2mm", fontWeight: 700, fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.04em", color: bc, borderBottom: `2px solid ${bc}`, width: i === 0 ? "auto" : i === 4 ? "8%" : i === 2 ? "8%" : i === 1 ? "10%" : "16%" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "3mm 2mm" }}>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{item.serviceName || "---"}</span>
                  {item.description && <><br /><span style={{ fontSize: "7.5pt", color: "#9ca3af" }}>{item.description}</span></>}
                </td>
                <td style={{ padding: "3mm 2mm", textAlign: "center", color: "#374151" }}>{item.quantity}</td>
                <td style={{ padding: "3mm 2mm", textAlign: "center", color: "#374151" }}>{item.unit}</td>
                <td style={{ padding: "3mm 2mm", textAlign: "right", color: "#374151" }}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ padding: "3mm 2mm", textAlign: "center", color: "#374151" }}>{item.vatPercentage}%</td>
                <td style={{ padding: "3mm 2mm", textAlign: "right", fontWeight: 700, color: "#111827" }}>{formatCurrency(calculateItemTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8mm" }}>
          <div style={{ width: "45%", maxWidth: "200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2mm 0", fontSize: "9pt", color: "#6b7280" }}><span>Subtotal</span><span style={{ color: "#374151" }}>{formatCurrency(calculateSubtotal(items))}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2mm 0", fontSize: "9pt", color: "#6b7280" }}><span>IVA</span><span style={{ color: "#374151" }}>{formatCurrency(calculateTotalVat(items))}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3mm 4mm", backgroundColor: bc, color: "#fff", borderRadius: "2mm", marginTop: "2mm", fontSize: "13pt", fontWeight: 800 }}><span>Total</span><span>{formatCurrency(calculateGrandTotal(items))}</span></div>
          </div>
        </div>

        {/* IBAN */}
        {company.iban && (
          <div style={{ borderLeft: `3px solid ${bc}`, paddingLeft: "4mm", marginBottom: "4mm" }}>
            <p style={{ fontSize: "7pt", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", margin: "0 0 1mm" }}>Dados de Pagamento</p>
            <p style={{ fontSize: "9pt", color: "#374151", margin: 0, fontFamily: "monospace" }}><strong>IBAN:</strong> {company.iban}</p>
          </div>
        )}

        {/* Notes */}
        {quote.notes && (
          <div style={{ borderLeft: `3px solid ${bc}`, paddingLeft: "4mm", marginTop: "4mm" }}>
            <p style={{ fontSize: "7pt", fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", margin: "0 0 2mm" }}>Observacoes</p>
            <p style={{ fontSize: "8pt", color: "#374151", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
