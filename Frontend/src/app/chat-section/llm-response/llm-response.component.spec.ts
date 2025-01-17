import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LlmResponseComponent } from './llm-response.component';

describe('LlmResponseComponent', () => {
  let component: LlmResponseComponent;
  let fixture: ComponentFixture<LlmResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LlmResponseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LlmResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
