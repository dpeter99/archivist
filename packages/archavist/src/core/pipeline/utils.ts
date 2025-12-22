import type { PipelineContext } from './types';
import type { DataComponent } from '../Content';
import { ComponentStore } from '../ComponentStore';

/**
 * Get a data component by type from any ComponentStore container
 *
 * This function works with both PipelineContext and Content objects,
 * or can be called directly with a ComponentStore instance.
 *
 * @param container - PipelineContext, Content, or ComponentStore instance
 * @param type - The type of data component to find
 * @returns The data component if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const pageIndex = getDataComponent<PageIndexComponent>(context, 'page-index');
 * if (pageIndex) {
 *   // pageIndex.entries contains all PageIndexEntry objects
 * }
 * ```
 */
export function getDataComponent<T extends DataComponent>(
  container: { dataComponents: ComponentStore } | ComponentStore,
  type: string
): T | undefined {
  // If passed a ComponentStore directly, use it
  if (container instanceof ComponentStore) {
    return container.get<T>(type);
  }
  // Otherwise, extract the dataComponents property
  return container.dataComponents.get<T>(type);
}
