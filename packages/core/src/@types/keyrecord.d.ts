/*import type { JSONSchemaType } from "ajv";
import type { Documents } from "@orbitdb/core";
import type { DBElements } from "@constl/bohr-db";

import Ajv from "ajv";

export type KeyRecord<T extends  string | number | boolean | {[clef: string]: unknown }> = Omit<
  KeyValue,
  "put" | "set" | "all"
> & {
  put(key: K, value: T): Promise<string>;
  set: KeyRecord<T>["put"];
  all: () => Promise<
    {
      value: T;
      hash: string;
    }[]
  >;
  allAsJSON(): Promise<T>;
};

export const typedKeyRecord = <T extends { [clef: string]: DBElements }>({
  db,
  schema,
}: {
  db: KeyRecord;
  schema: JSONSchemaType<Partial<T>>;
}): KeyRecord<T> => {
  return new Proxy(db, {
    get(target, prop) {
      const ajvValidator = new Ajv();
      if (prop === "get") {
        return async (
          key: K,
        ): Promise<T| undefined> => {
          const val = await target.get(key);
          if (val === undefined) return val;
          const valide = ajvValidator.validate(schema, val);
          return valide ? val : undefined;
        }
      } else if (prop === "put" || prop === "set") {
        return async (
          key: K,
          value: T,
        ): Promise<string> => {
          const valid = ajvValidator.validate(schema, value)
          if (valid) return await target.put(key, value);
          else
            throw ajvValidator.errors;
        };
      } else if (prop === "all") {
        return async () => {
          const all = await target.all();
          return all.filter((x) => ajvValidator.validate(schema, x));
        };
      } else {
        return target[prop as keyof typeof target];
      }
    },
  }) as unknown as TypedKeyRecord<T>;
};

*/
