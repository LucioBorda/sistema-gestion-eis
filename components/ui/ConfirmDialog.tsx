"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Info } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = true,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-4 pt-2 pb-2">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            isDanger ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
          }`}
        >
          {isDanger ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <Info className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={isDanger ? "danger" : "primary"}
          size="md"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
