export {
  API_BUILDABLE_TYPES,
  BUILD_TAB_BY_TYPE,
  CATALOG_ID_TO_TYPE,
  MAX_PER_PLANET_BY_TYPE,
  TYPE_TO_CATALOG_ID,
  WINDSURF_TERRESTRIAL_BUILDINGS,
} from '@galaxy/shared';

import { API_BUILDABLE_TYPES } from '@galaxy/shared';

export function isApiBuildable(type: string): boolean {
  return API_BUILDABLE_TYPES.has(type);
}
