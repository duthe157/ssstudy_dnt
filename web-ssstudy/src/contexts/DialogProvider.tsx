import { Dialog, DialogContent, DialogTitle } from "@/components/ui";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface IDialogOptions {
  type?: "error" | "warning" | "success";
  title?: React.ReactNode;
  message?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  okText?: string;
  onOK?: () => void | Promise<any>;
  onClose?: () => void | Promise<any>;
  onAfterOK?: () => void;
  confirmLoading?: boolean;
  component: React.ReactNode;
  footerClassName?: string;
  dialogClassName?: string;
  isShowClose?: boolean;
  isShowCancel?: boolean;
  onBackClick?: () => void;
}

interface DialogItem {
  id: string; // Unique ID for each dialog
  options: IDialogOptions;
  resolve: (value: boolean | PromiseLike<boolean>) => void;
  open: boolean;
}

export interface IDialogContext {
  show: (options: IDialogOptions) => Promise<boolean>;
  close: (id: string) => void;
  confirm: (id: string) => void;
  closeCurrent: () => void;
}

const DialogContext = createContext<IDialogContext | undefined>(undefined);

export default function DialogProvider({ children }: PropsWithChildren) {
  // State to store the list of dialogs
  const [dialogs, setDialogs] = useState<DialogItem[]>([]);

  // Generate a unique ID for each dialog
  const generateId = useCallback(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  // Function to open a new dialog
  const handleDialog = useCallback(
    (options: IDialogOptions) => {
      return new Promise<boolean>((resolve) => {
        const id = generateId();
        setDialogs((prev) => [...prev, { id, options, resolve, open: true }]);
      });
    },
    [generateId]
  );

  // Function to confirm a dialog
  const onConfirm = useCallback(
    (id: string) => {
      setDialogs((prev) =>
        prev.map((dialog) =>
          dialog.id === id ? { ...dialog, open: false } : dialog
        )
      );
      const dialog = dialogs.find((d) => d.id === id);
      if (dialog) {
        dialog.resolve(true);
        // Fix pointer-events issue
        setTimeout(() => (document.body.style.pointerEvents = ""), 0);
      }
    },
    [dialogs]
  );

  // Function to close a dialog
  const onClose = useCallback(
    (id: string) => {
      setDialogs((prev) =>
        prev.map((dialog) =>
          dialog.id === id ? { ...dialog, open: false } : dialog
        )
      );
      const dialog = dialogs.find((d) => d.id === id);
      if (dialog) {
        dialog.resolve(false);
        // Fix pointer-events issue
        setTimeout(() => (document.body.style.pointerEvents = ""), 0);
      }
    },
    [dialogs]
  );

  // Function to close the most recently opened dialog
  const closeCurrent = useCallback(() => {
    const currentDialog = dialogs[dialogs.length - 1]; // Get the latest dialog
    if (currentDialog) {
      onClose(currentDialog.id);
    }
  }, [dialogs, onClose]);

  // Remove a closed dialog from state after animation completes
  const handleDialogClose = useCallback((id: string) => {
    setDialogs((prev) => prev.filter((dialog) => dialog.id !== id));
  }, []);

  // Context value
  const value: IDialogContext = useMemo(
    () => ({
      show: handleDialog,
      close: onClose,
      confirm: onConfirm,
      closeCurrent,
    }),
    [handleDialog, onClose, onConfirm, closeCurrent]
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialogs.map(({ id, options, open }) => (
        <Dialog key={id} open={open}>
          <DialogContent
            className={options.dialogClassName}
            onBackClick={() => options.onBackClick?.() || onClose(id)}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={() => handleDialogClose(id)}
          >
            <DialogTitle />
            {options.component}
          </DialogContent>
        </Dialog>
      ))}
    </DialogContext.Provider>
  );
}

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("`useDialog` should be used within a `DialogProvider`");
  }
  return context;
};
