export interface ImportedNovaProject {
  version: number;
  type: string;
  exportedAt: string;
  project: {
    name: string;
    schema_json: {
      schemaVersion: string;
      data: any;
      cssVars?: any;
      interactions?: any;
      customCss?: any;
      symbols?: any;
      metadata?: any;
    };
  };
}
