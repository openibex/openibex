export class OiDataProducer {
  
  protected dbNamespace: string;
  protected dbPlugin: string;
  protected dbTag: string | undefined;
  protected dbName: string;

  constructor(namespace: string, pluginName: string, name: string, tag?: string, params?: {} ) {
    this.dbNamespace = namespace;
    this.dbPlugin = pluginName;
    this.dbTag = tag;
    this.dbName = name;
  }

  public async init() {};
}
