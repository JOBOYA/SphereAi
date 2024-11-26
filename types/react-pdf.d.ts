declare module 'react-pdf' {
  import { ComponentType, ReactElement, ReactNode } from 'react';
  
  export interface DocumentProps {
    file: string | File | null;
    onLoadSuccess?: (data: { numPages: number }) => void;
    children?: ReactNode;
  }

  export interface PageProps {
    pageNumber: number;
    width?: number;
    scale?: number;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;
  export const pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: string;
    };
    version: string;
  };
} 