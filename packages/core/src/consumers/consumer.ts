/**
 * The generic consumer class. All consumers need to extend from that.
 */
export class OiDataConsumer {
  
  protected dbNamespace: string;
  protected dbPlugin: string;
  protected dbTag: string | undefined;
  protected dbName: string;

  /**
   * Creates a consumer instance. AKA "the constructor".
   * 
   * @param namespace Namespace the consumer resides in.
   * @param pluginName Name of the plugin that provides the consumer.
   * @param name Consumer name
   * @param tag Consumer tag
   * @param params Consumer specific parameters.
   */
  constructor(namespace: string, pluginName: string, name: string, tag?: string, params?: {} ) {
    this.dbNamespace = namespace;
    this.dbPlugin = pluginName;
    this.dbTag = tag;
    this.dbName = name;
  }

  /**
   * init the consumer to open a new database.
   */
  public async init() {};
}
