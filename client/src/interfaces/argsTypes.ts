

// functions not included
export interface PaginationProps { 
    currentPage: number;
    totalRecords?:number;
    limit?:number;
    totalPages: number;
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

export interface QueryFilters {
    [key: string]: string | number | RangeFilter | boolean | ExactDate; 
}

// -1 descending order, 1 ascending order
export interface OrderByFilter {
    [key: string]: 1 | -1 | 'asc' | 'desc' | 'ASC' | 'DESC'
}
  