"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Info, type LucideIcon } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type DialogVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
}

interface AlertDialogProps {
  open: boolean;
  title: string;
  description: string | React.ReactNode;
  buttonLabel?: string;
  variant?: DialogVariant;
  icon?: LucideIcon;
  onClose: () => void;
}

interface PromptDialogProps {
  open: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

/* ─── Variant Styling ────────────────────────────────────────────────────────── */

const VARIANT_STYLES: Record<DialogVariant, { strip: string; iconBg: string; iconColor: string; button: string }> = {
  danger: {
    strip: "bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#B91C1C]",
    iconBg: "bg-[#FEE2E2]",
    iconColor: "text-[#B91C1C]",
    button: "bg-[#B91C1C] hover:bg-[#991B1B] shadow-[0_8px_18px_-8px_rgba(185,28,28,0.55)] hover:shadow-[0_12px_24px_-8px_rgba(153,27,27,0.65)]",
  },
  warning: {
    strip: "bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#B45309]",
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#B45309]",
    button: "bg-[#B45309] hover:bg-[#92400E] shadow-[0_8px_18px_-8px_rgba(180,83,9,0.55)] hover:shadow-[0_12px_24px_-8px_rgba(146,64,14,0.65)]",
  },
  info: {
    strip: "bg-gradient-to-r from-[#1B6EB7] via-[#2F8FCC] to-[#0F4C81]",
    iconBg: "bg-[#EAF2FA]",
    iconColor: "text-[#0F4C81]",
    button: "bg-[#1B6EB7] hover:bg-[#0F4C81] shadow-[0_8px_18px_-8px_rgba(27,110,183,0.55)] hover:shadow-[0_12px_24px_-8px_rgba(15,76,129,0.65)]",
  },
};

const DEFAULT_ICONS: Record<DialogVariant, LucideIcon> = {
  danger: Trash2,
  warning: AlertTriangle,
  info: Info,
};

/* ─── ConfirmDialog ──────────────────────────────────────────────────────────── */

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const style = VARIANT_STYLES[variant];
  const Icon = icon || DEFAULT_ICONS[variant];

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    cancelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-[#0F1B2D]/55 backdrop-blur-sm"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30),0_8px_24px_-8px_rgba(15,76,129,0.12)] overflow-hidden"
          >
            <div className={`h-1 w-full ${style.strip}`} />
            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className={`shrink-0 h-11 w-11 rounded-xl ${style.iconBg} flex items-center justify-center ${style.iconColor}`}>
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="confirm-dialog-title" className="font-heading text-xl font-bold text-mhsp-navy leading-tight">
                    {title}
                  </h2>
                  <div id="confirm-dialog-desc" className="mt-1.5 text-sm text-mhsp-muted leading-relaxed">
                    {description}
                  </div>
                </div>
              </div>
              <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                <button
                  ref={cancelRef}
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center justify-center rounded-lg border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg text-white px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] transition-all ${style.button}`}
                >
                  <Icon className="h-4 w-4" />
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── AlertDialog (single dismiss button) ────────────────────────────────────── */

export function AlertDialog({
  open,
  title,
  description,
  buttonLabel = "OK",
  variant = "warning",
  icon,
  onClose,
}: AlertDialogProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const style = VARIANT_STYLES[variant];
  const Icon = icon || DEFAULT_ICONS[variant];

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") onClose();
    }
    window.addEventListener("keydown", onKey);
    btnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-[#0F1B2D]/55 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-desc"
            className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30),0_8px_24px_-8px_rgba(15,76,129,0.12)] overflow-hidden"
          >
            <div className={`h-1 w-full ${style.strip}`} />
            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className={`shrink-0 h-11 w-11 rounded-xl ${style.iconBg} flex items-center justify-center ${style.iconColor}`}>
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="alert-dialog-title" className="font-heading text-xl font-bold text-mhsp-navy leading-tight">
                    {title}
                  </h2>
                  <div id="alert-dialog-desc" className="mt-1.5 text-sm text-mhsp-muted leading-relaxed">
                    {description}
                  </div>
                </div>
              </div>
              <div className="mt-7 flex justify-end">
                <button
                  ref={btnRef}
                  type="button"
                  onClick={onClose}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg text-white px-5 py-2.5 text-sm font-bold transition-all ${style.button}`}
                >
                  {buttonLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── PromptDialog (text input) ──────────────────────────────────────────────── */

export function PromptDialog({
  open,
  title,
  description,
  placeholder = "",
  defaultValue = "",
  confirmLabel = "Add",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, defaultValue]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onConfirm(value.trim());
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-[#0F1B2D]/55 backdrop-blur-sm"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-dialog-title"
            className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30),0_8px_24px_-8px_rgba(15,76,129,0.12)] overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#1B6EB7] via-[#2F8FCC] to-[#0F4C81]" />
            <form onSubmit={handleSubmit} className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-11 w-11 rounded-xl bg-[#EAF2FA] flex items-center justify-center text-[#0F4C81]">
                  <Info className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="prompt-dialog-title" className="font-heading text-xl font-bold text-mhsp-navy leading-tight">
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-1.5 text-sm text-mhsp-muted leading-relaxed">{description}</p>
                  )}
                </div>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="mt-5 w-full rounded-lg border border-[#DCE5EF] bg-[#F4F8FC] px-4 py-2.5 text-sm text-mhsp-navy placeholder:text-mhsp-muted/60 focus:outline-none focus:ring-2 focus:ring-[#1B6EB7]/30 focus:border-[#1B6EB7] transition-all"
              />
              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center justify-center rounded-lg border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  {cancelLabel}
                </button>
                <button
                  type="submit"
                  disabled={!value.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B6EB7] hover:bg-[#0F4C81] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] shadow-[0_8px_18px_-8px_rgba(27,110,183,0.55)] transition-all"
                >
                  {confirmLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Imperative hook (useConfirm) ───────────────────────────────────────────── */

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description: string | React.ReactNode;
    confirmLabel: string;
    cancelLabel: string;
    variant: DialogVariant;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    variant: "danger",
    resolve: null,
  });

  const confirm = useCallback(
    (opts: {
      title: string;
      description: string | React.ReactNode;
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: DialogVariant;
    }): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          open: true,
          title: opts.title,
          description: opts.description,
          confirmLabel: opts.confirmLabel ?? "Confirm",
          cancelLabel: opts.cancelLabel ?? "Cancel",
          variant: opts.variant ?? "danger",
          resolve,
        });
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state]);

  const DialogElement = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, DialogElement };
}
