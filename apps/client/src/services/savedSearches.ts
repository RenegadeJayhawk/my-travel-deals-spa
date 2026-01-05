import { SavedSearch, FilterState } from '../types/filters';

const STORAGE_KEY = 'travel-deals-saved-searches';

/**
 * Service for managing saved searches in LocalStorage
 * Provides CRUD operations for saved filter configurations
 */
export class SavedSearchesService {
  /**
   * Get all saved searches from LocalStorage
   */
  static getAll(): SavedSearch[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const searches = JSON.parse(stored) as SavedSearch[];
      return searches.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error loading saved searches:', error);
      return [];
    }
  }

  /**
   * Save a new search configuration
   */
  static save(name: string, filters: FilterState): SavedSearch {
    const searches = this.getAll();
    
    const newSearch: SavedSearch = {
      id: this.generateId(),
      name: name.trim(),
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };

    searches.push(newSearch);
    this.persist(searches);
    
    return newSearch;
  }

  /**
   * Update an existing saved search
   */
  static update(id: string, updates: Partial<SavedSearch>): SavedSearch | null {
    const searches = this.getAll();
    const index = searches.findIndex(s => s.id === id);
    
    if (index === -1) return null;
    
    searches[index] = {
      ...searches[index],
      ...updates,
    };
    
    this.persist(searches);
    return searches[index];
  }

  /**
   * Delete a saved search by ID
   */
  static delete(id: string): boolean {
    const searches = this.getAll();
    const filtered = searches.filter(s => s.id !== id);
    
    if (filtered.length === searches.length) return false;
    
    this.persist(filtered);
    return true;
  }

  /**
   * Mark a saved search as recently used
   */
  static markAsUsed(id: string): void {
    this.update(id, {
      lastUsed: new Date().toISOString(),
    });
  }

  /**
   * Check if a search name already exists
   */
  static nameExists(name: string, excludeId?: string): boolean {
    const searches = this.getAll();
    return searches.some(s => 
      s.name.toLowerCase() === name.toLowerCase().trim() && 
      s.id !== excludeId
    );
  }

  /**
   * Get a saved search by ID
   */
  static getById(id: string): SavedSearch | null {
    const searches = this.getAll();
    return searches.find(s => s.id === id) || null;
  }

  /**
   * Clear all saved searches
   */
  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Persist searches to LocalStorage
   */
  private static persist(searches: SavedSearch[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving searches:', error);
      throw new Error('Failed to save search. Storage may be full.');
    }
  }

  /**
   * Generate a unique ID for a saved search
   */
  private static generateId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
