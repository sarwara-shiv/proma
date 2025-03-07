

// functions not included
export interface PaginationProps { 
    currentPage: number;
    totalRecords?:number;
    limit?:number;
    totalPages: number;
}
// functions not included
export interface RichTextEditorProps { 
    value: string; 
    data?:any,
    onChange?: (content: string, data:any) => void; 
}
// functions not included
export interface SidePanelProps { 
    isOpen: boolean;
    title?:React.ReactNode;
    subtitle?:React.ReactNode;
    children: React.ReactNode;
    onClose?: () => void;
}


// Filters 
interface RangeFilter {
    from?: string | number; 
    till?: string | number;
    format?:string;  
    type: 'date' | 'number'; 
}
// Filters
interface ExactDate {
    date?: string; 
    format?:string;  
}

// Filters
export interface NotEqualTo {
    type:'notEqualTo'; 
    value?:string;  
}

export interface QueryFilters {
    [key: string]: string | number | RangeFilter | boolean | ExactDate | NotEqualTo; 
}

// -1 descending order, 1 ascending order
export interface OrderByFilter {
    [key: string]: 1 | -1 | 'asc' | 'desc' | 'ASC' | 'DESC'
}
  