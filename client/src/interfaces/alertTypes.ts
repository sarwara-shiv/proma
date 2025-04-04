
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
    title?: string | null | React.ReactNode;
    content: React.ReactNode | string;
    data?:any;
    display?:'timer' | null;
    type?:"info" | "error" | "fail" | "warning" | "success" | "form";
}

export interface CustomPopupType {
    isOpen: boolean;
    onClose?: () => void;
    title: string;
    content: React.ReactNode;
    yesBtnText?:string;
    noBtnText?:string;
    data?:any;
    type?: "form" | "text";
    yesFunction?:(data: any)=>void;
    noFunction?:(data:any)=>void;
  }