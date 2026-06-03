import { createContext, useContext, useState, useCallback } from "react";
import ConfirmDialog from "../components/ui/ConfirmDialog";

const ConfirmContext = createContext();
export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const openConfirm = useCallback((title, message, onConfirm) => {
    setDialog({
      open: true,
      title,
      message,
      onConfirm,
    });
  }, []);

  const closeConfirm = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  return (
    <ConfirmContext.Provider value={{ openConfirm }}>
      {children}

      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        onConfirm={() => {
          dialog.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />
    </ConfirmContext.Provider>
  );
}
