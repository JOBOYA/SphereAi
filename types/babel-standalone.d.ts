declare module '@babel/standalone' {
  type PresetOption = string | [string, object];
  type PluginOption = string | [string, object];

  interface BabelTransformOptions {
    filename?: string;
    presets?: PresetOption[];
    plugins?: PluginOption[];
    configFile?: string | boolean;
    babelrc?: boolean;
    ast?: boolean;
    compact?: boolean | 'auto';
    minified?: boolean;
    comments?: boolean;
    retainLines?: boolean;
    code?: boolean;
    sourceMaps?: boolean | 'inline' | 'both';
  }

  interface BabelFileResult {
    code: string;
    map?: object;
    ast?: object;
  }

  export function transform(
    code: string,
    options?: BabelTransformOptions
  ): BabelFileResult;

  export function transformFromAst(
    ast: object,
    code?: string,
    options?: BabelTransformOptions
  ): BabelFileResult;
} 