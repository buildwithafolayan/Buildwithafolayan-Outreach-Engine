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
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return;

    // Simple CSV parser supporting quotes
    const parseLine = (line: string) => {
      const result: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === "," && !inQuotes) {
          result.push(cur.trim());
          cur = "";
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headerRow = parseLine(lines[0]);
    setHeaders(headerRow);

    const rows: Array<Record<string, string>> = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      const rowObj: Record<string, string> = {};
      headerRow.forEach((h, idx) => {
        rowObj[h] = values[idx] || "";
      });
      rows.push(rowObj);
    }
    setParsedRows(rows);
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
        background: "rgba(0, 0, 0, 0.75)",
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
                Upload a CSV file containing your B2B prospect targets
              </p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>

          {/* Upload Drop Zone */}
          <div
            style={{
              border: "2px dashed var(--border-default)",
              borderRadius: "8px",
              padding: "28px",
              textAlign: "center",
              background: "var(--bg-tertiary)",
              marginBottom: "var(--space-4)",
              cursor: "pointer",
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
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
            <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
              {file ? file.name : "Click or drag CSV file here to upload"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              Supported columns: <code>first_name</code>, <code>last_name</code>, <code>email</code>, <code>company</code>, <code>industry</code>
            </p>
          </div>

          {/* Sample CSV preview */}
          {parsedRows.length > 0 && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Detected {parsedRows.length} rows ({headers.join(", ")})
                </span>
              </div>
              <div
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  background: "var(--bg-primary)",
                  padding: "10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {parsedRows.slice(0, 4).map((r, i) => (
                  <div key={i} style={{ borderBottom: "1px solid var(--border-subtle)", padding: "4px 0" }}>
                    {Object.values(r).slice(0, 4).join(" · ")}
                  </div>
                ))}
                {parsedRows.length > 4 && (
                  <div style={{ color: "var(--text-muted)", paddingTop: "4px" }}>
                    + {parsedRows.length - 4} more rows...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result Alert */}
          {result && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "var(--space-4)",
                background: result.error ? "var(--danger-soft)" : "var(--success-soft)",
                color: result.error ? "var(--danger)" : "var(--success)",
              }}
            >
              {result.error ? (
                <p>✕ {result.error}</p>
              ) : (
                <p>
                  ✓ Successfully imported <strong>{result.importedCount}</strong> new contacts!
                  {result.duplicatesSkipped ? ` (${result.duplicatesSkipped} duplicates skipped)` : ""}
                </p>
              )}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
            <button className="btn btn-secondary" onClick={onClose}>
              {result?.importedCount ? "Close" : "Cancel"}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={parsedRows.length === 0 || isProcessing}
            >
              {isProcessing ? "Importing..." : `Import ${parsedRows.length || 0} Contacts`}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
