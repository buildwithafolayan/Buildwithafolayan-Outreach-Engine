"use client";

import { useState } from "react";
import Card from "./Card";

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportCSVModal({ isOpen, onClose, onSuccess }: ImportCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Array<Record<string, string>>>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    importedCount?: number;
    duplicatesSkipped?: number;
    invalidSkipped?: number;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const parseCSVText = (text: string) => {
    // Robust RFC 4180 CSV parser supporting quotes, commas, and linebreaks
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // Skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if ((char === "\r" || char === "\n") && !insideQuotes) {
        if (char === "\r" && nextChar === "\n") i++;
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) return;

    const headerRow = rows[0].map((h) => h.replace(/^["']|["']$/g, "").trim());
    setHeaders(headerRow);

    const parsedObjects: Array<Record<string, string>> = [];
    for (let r = 1; r < rows.length; r++) {
      const rowValues = rows[r];
      const obj: Record<string, string> = {};
      headerRow.forEach((hdr, idx) => {
        obj[hdr] = rowValues[idx] || "";
      });
      parsedObjects.push(obj);
    }

    setParsedRows(parsedObjects);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) parseCSVText(content);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const res = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedRows }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
        onSuccess();
      } else {
        setResult({ error: data.error || "Failed to import contacts" });
      }
    } catch (e) {
      console.error(e);
      setResult({ error: "Network error during CSV import." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: "680px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card glass>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
            }}
          >
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Import Contacts from CSV</h3>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Upload any CSV prospect list (Apollo, Instantly, LinkedIn, Custom lists)
              </p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>

          {/* Upload Drop Zone */}
          <div
            style={{
              border: "2px dashed var(--border-default)",
              borderRadius: "10px",
              padding: "28px",
              textAlign: "center",
              background: "var(--bg-tertiary)",
              marginBottom: "var(--space-4)",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onClick={() => document.getElementById("csv-file-input")?.click()}
          >
            <input
              id="csv-file-input"
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
            <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
              {file ? file.name : "Click or drag CSV file here to upload"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              Auto-maps: <code>Full Name</code>, <code>First/Last Name</code>, <code>Email Address</code>, <code>Company</code>, <code>City/State</code>, <code>Notes</code>
            </p>
          </div>

          {/* CSV Preview */}
          {parsedRows.length > 0 && !result?.importedCount && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Ready to Import: {parsedRows.length} Prospects Detected
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "100px",
                    background: "hsl(220 20% 16%)",
                    color: "hsl(220 15% 70%)",
                  }}
                >
                  {headers.length} columns detected
                </span>
              </div>

              <div
                style={{
                  maxHeight: "160px",
                  overflowY: "auto",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-subtle)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {parsedRows.slice(0, 5).map((r, i) => (
                  <div
                    key={i}
                    style={{
                      borderBottom: i < 4 ? "1px solid var(--border-subtle)" : "none",
                      padding: "6px 0",
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {Object.entries(r)
                      .filter(([_, v]) => Boolean(v))
                      .slice(0, 4)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </div>
                ))}
                {parsedRows.length > 5 && (
                  <div style={{ color: "var(--text-muted)", paddingTop: "6px", fontSize: "11px" }}>
                    + {parsedRows.length - 5} more rows ready to import...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result Alert */}
          {result && (
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "10px",
                fontSize: "13px",
                marginBottom: "var(--space-4)",
                background: result.error ? "var(--danger-soft)" : "hsl(160 80% 12% / 0.7)",
                border: `1px solid ${result.error ? "var(--danger)" : "hsl(160 80% 25%)"}`,
                color: result.error ? "var(--danger)" : "hsl(160 80% 70%)",
              }}
            >
              {result.error ? (
                <p>✕ {result.error}</p>
              ) : (
                <div>
                  <p style={{ fontWeight: 650, fontSize: "14px", marginBottom: "4px" }}>
                    ✓ Successfully imported {result.importedCount} new contacts!
                  </p>
                  <p style={{ fontSize: "12px", opacity: 0.9 }}>
                    {result.duplicatesSkipped ? `${result.duplicatesSkipped} duplicates already existed. ` : ""}
                    {result.invalidSkipped ? `${result.invalidSkipped} invalid rows skipped.` : ""}
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
            <button className="btn btn-secondary" onClick={onClose}>
              {result?.importedCount ? "Done" : "Cancel"}
            </button>
            {!result?.importedCount && (
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={parsedRows.length === 0 || isProcessing}
              >
                {isProcessing ? "Importing Prospects..." : `Import ${parsedRows.length || 0} Contacts`}
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
