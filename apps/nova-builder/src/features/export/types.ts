export interface ExportedNovaProject {
  version: number;
  type: string;
  exportedAt: string;
  project: {
    name: string;
    schema_json: {
      schemaVersion: string;
      data: {
        pages: any;
        assets: any;
        dataSources: any;
        resources: any;
        instances: any;
        props: any;
        breakpoints: any;
        styleSourceSelections: any;
        styleSources: any;
        styles: any;
      };
      cssVars: any;
      interactions: any;
      customCss: any;
      symbols: any;
      metadata: {
        description: string;
        thumbnail: string;
      };
    };
  };
}
