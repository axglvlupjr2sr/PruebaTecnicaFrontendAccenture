import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';
import { IonicModule } from '@ionic/angular';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;
  let component: EmptyStateComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default message', () => {
    const el: HTMLElement = fixture.nativeElement;
    const msg = el.querySelector('.empty-state__message');
    expect(msg?.textContent?.trim()).toBe('No tasks yet');
  });

  it('should display custom message when provided', () => {
    fixture.componentRef.setInput('message', 'All done! Great job.');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const msg = el.querySelector('.empty-state__message');
    expect(msg?.textContent?.trim()).toBe('All done! Great job.');
  });

  it('should have status role for accessibility', () => {
    const el: HTMLElement = fixture.nativeElement;
    const wrapper = el.querySelector('[role="status"]');
    expect(wrapper).toBeTruthy();
  });

  it('should have aria-live="polite" for accessibility', () => {
    const el: HTMLElement = fixture.nativeElement;
    const wrapper = el.querySelector('[aria-live="polite"]');
    expect(wrapper).toBeTruthy();
  });
});
