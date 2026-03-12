"use client"

import type { Quote } from "@/lib/types"
import { calculateItemTotal, calculateSubtotal, calculateTotalVat, calculateGrandTotal, formatCurrency, formatDate } from "@/lib/quotes"

interface Props { quote: Quote }

export function TemplateMinimalista({ quote }: Props) {
  const { company, client, items } = quote

  return (
    <div id="quote-preview" className="mx-auto bg-white text-gray-900" style={{ width: "210mm", minHeight: "297mm", padding: "24mm 22mm", fontFamily: "'Inter', system-ui, sans-serif", fontSize: "9.5pt", lineHeight: 1.6, color: "#1a1a1a" }}>
      {/* Header -- ultra minimal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "14mm" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
          {company.logo && <img src={company.logo} alt="Logo" style={{ height: "12mm", width: "12mm", objectFit: "contain" }} crossOrigin="anonymous" />}
          <span style={{ fontSize: "14pt", fontWeight: 300, letterSpacing: "-0.02em", color: "#1a1a1a" }}>{company.name || "Empresa"}</span>
        </div>
        <span style={{ fontSize: "24pt", fontWeight: 200, color: "#d4d4d4", letterSpacing: "-0.04em" }}>ORCAMENTO</span>
      </div>

      <div style={{ height: "0.5px", backgroundColor: "#e5e5e5", marginBottom: "10mm" }} />

      {/* Meta row */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10mm", fontSize: "8pt", color: "#737373" }}>
        <div style={{ display: "flex", gap: "8mm" }}>
          <div><span style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "6.5pt", marginBottom: "1mm" }}>N.o</span><span style={{ color: "#1a1a1a", fontWeight: 500, fontSize: "9pt" }}>{quote.number}</span></div>
          <div><span style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "6.5pt", marginBottom: "1mm" }}>Data</span><span style={{ color: "#1a1a1a", fontWeight: 500, fontSize: "9pt" }}>{formatDate(quote.createdAt)}</span></div>
          <div><span style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "6.5pt", marginBottom: "1mm" }}>Validade</span><span style={{ color: "#1a1a1a", fontWeight: 500, fontSize: "9pt" }}>{formatDate(quote.validUntil)}</span></div>
        </div>
        {quote.projectTitle && (
          <div style={{ textAlign: "right" }}><span style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "6.5pt", marginBottom: "1mm" }}>Projeto</span><span style={{ color: "#1a1a1a", fontWeight: 500, fontSize: "9pt" }}>{quote.projectTitle}</span></div>
        )}
      </div>

      {/* From / To */}
      <div style={{ display: "flex", gap: "12mm", marginBottom: "12mm" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: "#a3a3a3", margin: "0 0 2mm" }}>De</p>
          <p style={{ fontWeight: 500, margin: 0 }}>{company.name}</p>
          {company.nif && <p style={{ fontSize: "8pt", color: "#737373", margin: "1mm 0 0" }}>NIF: {company.nif}</p>}
          {company.address && <p style={{ fontSize: "8pt", color: "#737373", margin: "1mm 0 0" }}>{company.address}</p>}
          {company.email && <p style={{ fontSize: "8pt", color: "#737373", margin: "1mm 0 0" }}>{company.email}</p>}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: "#a3a3a3", margin: "0 0 2mm" }}>Para</p>
          <p style={{ fontWeight: 500, margin: 0 }}>{client.name || "---"}</p>
          {client.nif && <p style={{ fontSize: "8pt", color: "#737373", margin: "1mm 0 0" }}>NIF: {client.nif}</p>}
          {client.address && <p style={{ fontSize: "8pt", color: "#737373", margin: "1mm 0 0" }}>{client.address}</p>}
          {client.email && <p style={{ fontSize: "8pt", color: "#737373", margin: "1mm 0 0" }}>{client.email}</p>}
        </div>
      </div>

      {/* Items -- clean lines */}
      <div style={{ marginBottom: "8mm" }}>
        <div style={{ display: "flex", padding: "0 0 2mm", borderBottom: "1px solid #e5e5e5", fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.08em", color: "#a3a3a3" }}>
          <span style={{ flex: 1 }}>Descricao</span>
          <span style={{ width: "12%", textAlign: "center" }}>Qtd</span>
          <span style={{ width: "16%", textAlign: "right" }}>P. Unit.</span>
          <span style={{ width: "8%", textAlign: "center" }}>IVA</span>
          <span style={{ width: "16%", textAlign: "right" }}>Total</span>
        </div>
        {items.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "baseline", padding: "3mm 0", borderBottom: "1px solid #f5f5f5" }}>
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 500 }}>{item.serviceName || "---"}</span>
              {item.description && <span style={{ display: "block", fontSize: "7.5pt", color: "#a3a3a3", marginTop: "0.5mm" }}>{item.description}</span>}
            </span>
            <span style={{ width: "12%", textAlign: "center", color: "#737373" }}>{item.quantity} {item.unit}</span>
            <span style={{ width: "16%", textAlign: "right", color: "#737373" }}>{formatCurrency(item.unitPrice)}</span>
            <span style={{ width: "8%", textAlign: "center", color: "#a3a3a3", fontSize: "8pt" }}>{item.vatPercentage}%</span>
            <span style={{ width: "16%", textAlign: "right", fontWeight: 600 }}>{formatCurrency(calculateItemTotal(item))}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10mm" }}>
        <div style={{ width: "40%", maxWidth: "180px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1.5mm 0", fontSize: "8.5pt", color: "#737373" }}><span>Subtotal</span><span>{formatCurrency(calculateSubtotal(items))}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1.5mm 0", fontSize: "8.5pt", color: "#737373" }}><span>IVA</span><span>{formatCurrency(calculateTotalVat(items))}</span></div>
          <div style={{ height: "0.5px", backgroundColor: "#1a1a1a", margin: "2mm 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14pt", fontWeight: 300 }}><span>Total</span><span style={{ fontWeight: 600 }}>{formatCurrency(calculateGrandTotal(items))}</span></div>
        </div>
      </div>

      {/* IBAN */}
      {company.iban && (
        <div style={{ marginBottom: "4mm", fontSize: "8pt", color: "#737373" }}>
          <span style={{ fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: "#a3a3a3" }}>IBAN </span>
          <span style={{ fontFamily: "monospace", fontSize: "8.5pt" }}>{company.iban}</span>
        </div>
      )}

      {/* Notes */}
      {quote.notes && (
        <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: "4mm", marginTop: "4mm" }}>
          <p style={{ fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: "#a3a3a3", margin: "0 0 2mm" }}>Notas</p>
          <p style={{ fontSize: "8pt", color: "#737373", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{quote.notes}</p>
        </div>
      )}
    </div>
  )
}
