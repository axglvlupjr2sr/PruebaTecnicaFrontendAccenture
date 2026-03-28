import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide seed categories', () => {
    const categories = service.getCategories();
    expect(categories).toBeTruthy();
    expect(Array.isArray(categories)).toBeTrue();
  });

  it('should include at least 5 categories', () => {
    const categories = service.getCategories();
    expect(categories.length).toBeGreaterThanOrEqual(5);
  });

  it('should have unique ids', () => {
    const categories = service.getCategories();
    const ids = categories.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should include expected category ids', () => {
    const categories = service.getCategories();
    const ids = categories.map((c) => c.id);
    expect(ids).toContain('work');
    expect(ids).toContain('personal');
    expect(ids).toContain('shopping');
    expect(ids).toContain('health');
    expect(ids).toContain('learning');
  });

  it('should expose categories as a readonly signal', () => {
    // The categories signal should return the same list
    const fromSignal = service.categories();
    const fromMethod = service.getCategories();
    expect(fromSignal).toEqual(fromMethod);
  });
});
