import type { PipelineContext } from './types';
import type { DataComponent } from '../Content';

/**
 * Get a data component from the pipeline context by type
 *
 * @param context - The pipeline context
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
  context: PipelineContext,
  type: string
): T | undefined {
  return context.dataComponents.find(
    (component) => component.type === type
  ) as T | undefined;
}
