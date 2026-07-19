"use client";

import { useEffect, useState, useRef } from "react";
import { UI_VARS as C } from "@/lib/uiTheme";

type Step = "confirm" | "create" | "saveAs";

type SaveProjectDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  isDemo: boolean;
  projectName: string;
  onUpdate: () => Promise<void>;
  onCreate: (name: string, description: string, thumbnail: string) => Promise<void>;
  onSaveAs: (newName: string) => Promise<void>;
};

export function SaveProjectDialog({
  isOpen,
  onClose,
  isDemo,
  projectName,
  onUpdate,
  onCreate,
  onSaveAs,
}: SaveProjectDialogProps) {
  const [step, setStep] = useState<Step>(isDemo ? "create" : "confirm");
  const [name, setName] = useState(projectName || "Untitled Project");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [saveAsName, setSaveAsName] = useState(projectName ? `${projectName} (copy)` : "Untitled Project (copy)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const saveAsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(isDemo ? "create" : "confirm");
      setName(projectName || "Untitled Project");
      setDescription("");
      setThumbnail("");
      setSaveAsName(projectName ? `${projectName} (copy)` : "Untitled Project (copy)");
      setIsSubmitting(false);
      setErrorMsg(null);

      // Auto-focus active input
      setTimeout(() => {
        if (isDemo) {
          nameInputRef.current?.focus();
          nameInputRef.current?.select();
        }
      }, 50);
    }
  }, [isOpen, isDemo, projectName]);

  useEffect(() => {
    if (step === "saveAs") {
      setTimeout(() => {
        saveAsInputRef.current?.focus();
        saveAsInputRef.current?.select();
      }, 50);
    }
  }, [step]);

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  const handleBack = () => {
    if (isDemo) {
      setStep("create");
    } else {
      setStep("confirm");
    }
    setErrorMsg(null);
  };

  const handleUpdateClick = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Project name is required.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onCreate(name.trim(), description.trim(), thumbnail.trim());
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveAsName.trim()) {
      setErrorMsg("Project name is required.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSaveAs(saveAsName.trim());
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save copy. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const modalStyle: React.CSSProperties = {
    width: 440,
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
    color: C.text,
    fontFamily: C.font,
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: C.text,
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    background: "rgba(255,255,255,0.05)",
    color: C.text,
    fontSize: 13,
    fontFamily: C.font,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: C.textMuted,
    marginBottom: 4,
    display: "block",
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    fontFamily: C.font,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.12s",
  };

  const primaryBtnStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: C.accent,
    color: "#fff",
  };

  const secondaryBtnStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: "transparent",
    border: `1px solid ${C.border}`,
    color: C.text,
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={titleStyle}>
            {step === "confirm" && "Save changes?"}
            {step === "create" && "Save Project"}
            {step === "saveAs" && "Save Project As"}
          </h2>
          {!isSubmitting && (
            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", color: C.textMuted, fontSize: 18, cursor: "pointer", lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{ padding: "8px 12px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, color: "#f87171", fontSize: 12 }}>
            {errorMsg}
          </div>
        )}

        {/* STEP 1: CONFIRM */}
        {step === "confirm" && (
          <>
            <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
              Choose how you want to save your changes to the project.
            </p>
            <div style={{ fontSize: 14, fontWeight: 700, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: `1px solid ${C.border}` }}>
              Project: <span style={{ color: C.accentText }}>{projectName}</span>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={onClose} disabled={isSubmitting} style={secondaryBtnStyle}>
                Cancel
              </button>
              <button onClick={() => setStep("saveAs")} disabled={isSubmitting} style={secondaryBtnStyle}>
                Save As
              </button>
              <button onClick={handleUpdateClick} disabled={isSubmitting} style={primaryBtnStyle}>
                {isSubmitting ? (
                  <span className="spinner" style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                ) : null}
                Update
              </button>
            </div>
          </>
        )}

        {/* STEP 2: CREATE */}
        {step === "create" && (
          <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Project Name</label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Portfolio Website"
                disabled={isSubmitting}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. My personal portfolio built with Nova Builder"
                rows={2}
                disabled={isSubmitting}
                style={textareaStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Thumbnail URL (Optional)</label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="e.g. https://example.com/thumbnail.png"
                disabled={isSubmitting}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" onClick={onClose} disabled={isSubmitting} style={secondaryBtnStyle}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} style={primaryBtnStyle}>
                {isSubmitting ? (
                  <span className="spinner" style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                ) : null}
                Create Project
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SAVE AS */}
        {step === "saveAs" && (
          <form onSubmit={handleSaveAsSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
              Save a new copy of this project under a different name. The original project will remain unchanged.
            </p>

            <div>
              <label style={labelStyle}>New Project Name</label>
              <input
                ref={saveAsInputRef}
                type="text"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="e.g. Landing Page (Copy)"
                disabled={isSubmitting}
                style={inputStyle}
                required
              />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" onClick={handleBack} disabled={isSubmitting} style={secondaryBtnStyle}>
                Back
              </button>
              <button type="submit" disabled={isSubmitting} style={primaryBtnStyle}>
                {isSubmitting ? (
                  <span className="spinner" style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                ) : null}
                Save As Copy
              </button>
            </div>
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
      ` }} />
    </div>
  );
}
