"use client";

import { useState } from "react";
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";

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
          i++;
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Import Contacts from CSV
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              Upload any lead list (Apollo, Instantly, LinkedIn, Custom lists)
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ padding: "4px" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Upload Dropzone */}
        <div
          style={{
            border: "1px dashed var(--border-strong)",
            borderRadius: "var(--radius-sm)",
            padding: "24px",
            textAlign: "center",
            backgroundColor: "var(--bg-surface-elevated)",
            marginBottom: "16px",
            cursor: "pointer",
            transition: "border-color 0.12s ease",
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
          <UploadCloud size={24} strokeWidth={1.5} style={{ color: "var(--text-tertiary)", margin: "0 auto 8px" }} />
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
            {file ? file.name : "Select or drag CSV file here"}
          </p>
          <p style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
            Auto-detects: name, email, company, location, and notes columns
          </p>
        </div>

        {/* Preview */}
        {parsedRows.length > 0 && !result?.importedCount && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                {parsedRows.length} prospects detected
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {headers.length} columns
              </span>
            </div>

            <div
              style={{
                maxHeight: "130px",
                overflowY: "auto",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                padding: "8px 12px",
                borderRadius: "var(--radius-xs)",
                fontSize: "11.5px",
                fontFamily: "var(--font-mono)",
              }}
            >
              {parsedRows.slice(0, 4).map((r, i) => (
                <div
                  key={i}
                  style={{
                    borderBottom: i < 3 ? "1px solid var(--border-subtle)" : "none",
                    padding: "4px 0",
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
              {parsedRows.length > 4 && (
                <div style={{ color: "var(--text-muted)", paddingTop: "4px", fontSize: "11px" }}>
                  + {parsedRows.length - 4} more rows...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result alert */}
        {result && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: "12.5px",
              marginBottom: "16px",
              background: result.error ? "var(--danger-soft)" : "var(--success-soft)",
              border: result.error ? "1px solid var(--danger-border)" : "1px solid var(--success-border)",
              color: result.error ? "#f87171" : "#34d399",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {result.error ? (
              <>
                <AlertCircle size={14} strokeWidth={2} />
                <span>{result.error}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} strokeWidth={2} />
                <div>
                  <p style={{ fontWeight: 600 }}>Imported {result.importedCount} new contacts</p>
                  <p style={{ fontSize: "11.5px", opacity: 0.85 }}>
                    {result.duplicatesSkipped ? `${result.duplicatesSkipped} duplicates skipped. ` : ""}
                    {result.invalidSkipped ? `${result.invalidSkipped} invalid skipped.` : ""}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {result?.importedCount ? "Done" : "Cancel"}
          </button>
          {!result?.importedCount && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleImport}
              disabled={parsedRows.length === 0 || isProcessing}
            >
              {isProcessing ? "Importing..." : `Import ${parsedRows.length || 0} Contacts`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
