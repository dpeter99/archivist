import type { DataComponent } from './Content';

/**
 * Registry for managing data components with type-safe retrieval
 *
 * This class provides a clean API for storing and retrieving data components
 * by type, used by both PipelineContext and Content.
 */
export class ComponentStore {
  private components: DataComponent[] = [];

  /**
   * Add a data component to the store
   */
  add(component: DataComponent): void {
    this.components.push(component);
  }

  /**
   * Get a data component by type
   * @returns The component if found, undefined otherwise
   */
  get<T extends DataComponent>(type: T["id"]): T | undefined {
    return this.components.find(c => c.type === type) as T | undefined;
  }

  /**
   * Check if a component of the given type exists
   */
  has(type: string): boolean {
    return this.components.some(c => c.type === type);
  }

  /**
   * Get all components as a readonly array
   */
  getAll(): readonly DataComponent[] {
    return this.components;
  }

  /**
   * Get the number of components
   */
  get length(): number {
    return this.components.length;
  }

  /**
   * Make the class iterable (for...of loops)
   */
  *[Symbol.iterator](): Iterator<DataComponent> {
    for (const component of this.components) {
      yield component;
    }
  }
}
