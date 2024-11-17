declare module 'react-pdf' {
  import { ComponentType } from 'react';
  
  export interface DocumentProps {
    file: string | File | { url: string };
    onLoadSuccess?: (document: { numPages: number }) => void;
    loading?: React.ReactNode;
    error?: React.ReactNode;
    options?: any;
  }

  export interface PageProps {
    pageNumber: number;
    width?: number;
    className?: string;
    loading?: React.ReactNode;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;
  export const pdfjs: any;
} 