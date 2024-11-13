declare module 'formidable' {
  import { IncomingForm } from 'formidable';
  import { IncomingMessage } from 'http';

  interface File {
    filepath: string;
    originalFilename: string;
    mimetype: string;
    size: number;
  }

  interface Fields {
    [key: string]: string | string[];
  }

  interface Files {
    [key: string]: File[];
  }

  interface Options {
    encoding?: string;
    uploadDir?: string;
    keepExtensions?: boolean;
    maxFileSize?: number;
    multiples?: boolean;
  }

  class FormidableForm {
    parse(
      req: IncomingMessage
    ): Promise<[Fields, Files]>;
  }

  function formidable(options?: Options): FormidableForm;

  export = formidable;
} 