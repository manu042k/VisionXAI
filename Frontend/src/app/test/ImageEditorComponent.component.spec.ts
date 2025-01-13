import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageEditorComponentComponent } from './ImageEditorComponent.component';

describe('ImageEditorComponentComponent', () => {
  let component: ImageEditorComponentComponent;
  let fixture: ComponentFixture<ImageEditorComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageEditorComponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageEditorComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
