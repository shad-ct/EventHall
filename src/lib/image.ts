// Utility to normalize program/host image fields across different APIs and DB schemas
export const getHostImage = (obj: any): string | undefined => {
  if (!obj) return undefined;

  const tryKeys = (o: any, keys: string[]) => {
    for (const k of keys) {
      // support nested keys like 'host.photoUrl'
      if (k.includes('.')) {
        const parts = k.split('.');
        let cur = o;
        for (const p of parts) {
          if (cur == null) break;
          cur = cur[p];
        }
        if (cur != null) return cur;
      } else {
        if (o[k] != null) return o[k];
      }
    }
    return undefined;
  };

  // Prefer program-level logo fields first, then fall back to host-level fields
  const programKeys = ['programLogo', 'program_logo', 'logoUrl', 'logo_url', 'logo', 'program_logo_url', 'imageUrl', 'image_url'];
  const hostKeys = ['logoUrl', 'logo_url', 'photoUrl', 'photo_url', 'photo', 'imageUrl', 'image_url'];

  // Try program-level values on the root object first
  const fromProgram = tryKeys(obj, programKeys);
  if (fromProgram) return fromProgram;

  // Then try host object (if present)
  const fromHost = tryKeys(obj.host || {}, hostKeys);
  if (fromHost) return fromHost;

  // Finally, try other root-level host-like keys as a last resort
  const fromRoot = tryKeys(obj, hostKeys);
  if (fromRoot) return fromRoot;

  return undefined;
};

export default getHostImage;
