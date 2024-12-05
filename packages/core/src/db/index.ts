import { useDatabaseType } from '@orbitdb/core';
import { OiScoredSet } from './scoredset';
import { registerSet } from '@orbitdb/set-db';
import { OiKeyValueExtendedDatabase } from './keyvalue-extended';
import { OiNKeyValueDatabase } from './nkeyvalue';

// Internal database functions for core.
export { OiDatabase } from './database';

// Generic data types for databases.
export type { OiDbElements, OiDbSchema } from './dbtypes';

// The database Manager
export { OiDbManager } from './manager';

// Databases available.
export { OiScoredSet } from './scoredset';
export { type OiKeyValueExtended } from './keyvalue-extended';
export { type OiNKeyValue } from './nkeyvalue';


export function registerDatabaseTypes() {
  registerSet();
  useDatabaseType(OiScoredSet);
  useDatabaseType(OiKeyValueExtendedDatabase);
  useDatabaseType(OiNKeyValueDatabase);
}
