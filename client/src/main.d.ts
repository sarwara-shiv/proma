import '@tanstack/react-table'

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    style?: {
      textAlign?: 'left' | 'center' | 'right',
      width?:string,
      color?:string,
      backgroundColor?:string,
      tColor?:string,
      maxWidth?:string,
      minWidth?:string,
      lineHeight?:number,
      fontSize?:string
    }
  }
}