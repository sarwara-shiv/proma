
export interface FlashPopupType{
    isOpen: boolean;
    message: string;
    duration?: number; // Duration in milliseconds
    onClose?: () => void;
    type?: "info" | "error" | "fail" | "warning" | "success";
    position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export interface AlertPopupType {
    isOpen: boolean;
    onClose?: () => void;
    title?: string | null;
    content: React.ReactNode | string;
    data?:any;
    display?:'timer' | null;
    type?:"info" | "error" | "fail" | "warning" | "success" | "form";
  }