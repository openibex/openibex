import { Identities, IdentitiesType } from '@orbitdb/core'
import { Helia } from 'helia';

const id = 'node-default'

let identities: IdentitiesType;
let identity: any;

export async function initIdentitiesManager(ipfs: Helia, path: string) {
  if(!identities) {
    identities = await Identities({ipfs, path: `${path}/identities`});
    identity = identities.createIdentity({ id });
  }
}

export function getIdentitiesManager() {
  if(!identities) throw Error(`Identity: No Identity Manager initialized. Call initIdentitiesManager() first.`);
  return identities;
}

export function getDefaultIdentityID() {
  if(!identities) throw Error(`Identity: No default identity configured. Call initIdentitiesManager() first.`);

  return id;
}
