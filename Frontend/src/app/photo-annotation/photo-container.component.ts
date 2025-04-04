import {
  Component,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import * as ImageActions from '../+state/image/image.actions';
import * as ImageSelectors from '../+state/image/image.selectors';
import { ImageState } from '../+state/image/image.state';
import { DividerModule } from 'primeng/divider';
import * as chatActions from '../+state/chat/chat.actions';
import { Subscription } from 'rxjs';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  id: number; // Unique ID for potential future features (like selection)
  points: Point[];
  color: string;
  completed: boolean;
}

@Component({
  selector: 'app-photo-container',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TooltipModule, // ScrollPanelModule removed as canvas handles overflow now
    DividerModule,
  ],
  templateUrl: './photo-container.component.html',
  styleUrls: ['./photo-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Use OnPush for better performance
})
export class PhotoContainerComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false })
  canvas?: ElementRef<HTMLCanvasElement>; // static: false as it's inside *ngIf
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private store = inject(Store<{ image: ImageState }>);
  private cdr = inject(ChangeDetectorRef); // Inject ChangeDetectorRef
  private imageSubscription?: Subscription;

  public ctx?: CanvasRenderingContext2D | null;
  public image?: HTMLImageElement;
  public polygons: Polygon[] = [];
  private nextPolygonId = 0;
  public currentPolygonIndex: number = -1; // Index of the polygon currently being drawn, -1 if none

  // History stacks
  public undoStack: Polygon[][] = [];
  public redoStack: Polygon[][] = [];

  public isDrawingEnabled: boolean = false;
  public imageUrl$ = this.store.select(ImageSelectors.selectBase64Image);

  private readonly POINT_RADIUS = 7; // Increased size of the points
  private readonly CLOSING_THRESHOLD = 10; // Pixels close enough to the start point to close the polygon
  private readonly COLORS = [
    // Predefined color cycle
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#FF33A1',
    '#A133FF',
    '#33FFA1',
    '#FF9A33',
    '#FFFF33',
    '#33FFFF',
    '#FF33F5',
  ];

  ngOnInit(): void {
    this.imageSubscription = this.imageUrl$.subscribe((base64Image) => {
      if (base64Image) {
        this.loadImage(base64Image);
      } else {
        // Handle image cleared from state
        this.resetCanvasState();
        this.cdr.markForCheck(); // Trigger change detection
      }
    });
  }

  ngOnDestroy(): void {
    this.imageSubscription?.unsubscribe(); // Clean up subscription
  }

  private setupCanvas(): void {
    if (!this.canvas?.nativeElement) return;
    this.ctx = this.canvas.nativeElement.getContext('2d');
    if (this.image) {
      // Set canvas dimensions to match image dimensions
      this.canvas.nativeElement.width = this.image.naturalWidth;
      this.canvas.nativeElement.height = this.image.naturalHeight;
      this.draw(); // Initial draw after setup
    }
    this.cdr.markForCheck();
  }

  private loadImage(base64Image: string): void {
    this.resetCanvasState(); // Clear previous state before loading new image
    this.image = new Image();
    this.image.src = base64Image;
    this.image.onload = () => {
      // Important: Setup canvas *after* image is loaded to get dimensions
      this.setupCanvas();
    };
    this.image.onerror = (err) => {
      console.error('Error loading image:', err);
      // Optionally dispatch an error action or show a message
    };
    this.cdr.markForCheck();
  }

  public triggerFileInput(): void {
    this.fileInput?.nativeElement.click();
  }

  public toggleDrawing(): void {
    if (!this.image) return;
    this.isDrawingEnabled = !this.isDrawingEnabled;
    if (!this.isDrawingEnabled && this.currentPolygonIndex !== -1) {
      // If disabling drawing, consider the current polygon unfinished
      this.currentPolygonIndex = -1; // Stop actively drawing it
      this.draw();
    } else if (this.isDrawingEnabled && this.currentPolygonIndex === -1) {
      // Optionally auto-start a new polygon when enabling draw mode
      // this.startNewPolygon();
    }
    this.cdr.markForCheck();
  }

  public uploadImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Clear existing state before reading new file
      // Note: loadImage called via subscription will handle the rest
      this.store.dispatch(ImageActions.setImage({ base64Image: '' })); // Clear first
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        this.pushUndoState(); // Save state *before* loading new image
        this.store.dispatch(ImageActions.setImage({ base64Image }));
      };
      reader.readAsDataURL(file);
      target.value = ''; // Reset file input
    }
  }

  private getClickCoordinates(event: MouseEvent): Point | null {
    if (!this.canvas?.nativeElement) return null;
    const canvasElement = this.canvas.nativeElement;
    const rect = canvasElement.getBoundingClientRect();

    // Calculate the scale factor based on the actual size of the canvas and its displayed size
    const scaleX = canvasElement.width / rect.width;
    const scaleY = canvasElement.height / rect.height;

    // Get the mouse coordinates relative to the viewport
    const clientX = event.clientX;
    const clientY = event.clientY;

    // Adjust the mouse coordinates to be relative to the canvas and scaled correctly
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  }

  private getDistance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public handleCanvasClick(event: MouseEvent): void {
    if (!this.isDrawingEnabled || !this.image || !this.ctx) return;

    const point = this.getClickCoordinates(event);
    if (!point) return;

    // If no polygon is being drawn, start a new one
    if (
      this.currentPolygonIndex === -1 ||
      this.polygons[this.currentPolygonIndex]?.completed
    ) {
      this.startNewPolygon();
    }

    const activePolygon = this.polygons[this.currentPolygonIndex];
    if (activePolygon) {
      const startPoint = activePolygon.points[0];
      // Check if clicking near the start point to close the polygon
      if (
        activePolygon.points.length >= 3 &&
        this.getDistance(point, startPoint) < this.CLOSING_THRESHOLD
      ) {
        this.completeCurrentPolygon(true); // Mark as completed
      } else {
        // Add the new point
        activePolygon.points.push(point);
      }
      this.pushUndoState(); // Save state after modification
      this.draw();
      this.cdr.markForCheck();
    }
  }

  private startNewPolygon(): void {
    this.pushUndoState(); // Save state before adding potentially
    const newPolygon: Polygon = {
      id: this.nextPolygonId++,
      points: [],
      color: this.getColor(this.polygons.length),
      completed: false,
    };
    this.polygons.push(newPolygon);
    this.currentPolygonIndex = this.polygons.length - 1;
    this.redoStack = []; // Clear redo stack on new action
  }

  public completeCurrentPolygon(closeLoop: boolean = true): void {
    if (
      this.currentPolygonIndex !== -1 &&
      this.polygons[this.currentPolygonIndex]
    ) {
      const activePolygon = this.polygons[this.currentPolygonIndex];
      if (activePolygon.points.length >= 3) {
        this.pushUndoState();
        activePolygon.completed = true;
        if (closeLoop) {
          // Optional: Ensure the visual loop closes by adding start point again,
          // or handle in drawing logic. Let's handle in draw logic.
        }
        this.currentPolygonIndex = -1; // Ready for a new polygon next click
        this.redoStack = [];
        this.draw();
      } else {
        // Maybe provide feedback: "Need at least 3 points"
        console.warn('Cannot complete polygon with less than 3 points.');
      }
      this.cdr.markForCheck();
    }
  }

  public draw(): void {
    if (!this.ctx || !this.canvas?.nativeElement) return;

    const canvas = this.canvas.nativeElement;
    // Clear canvas
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image if it exists
    if (this.image) {
      this.ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
    } else {
      return; // No image, nothing more to draw
    }

    // Draw all polygons
    this.polygons.forEach((polygon, index) => this.drawPolygon(polygon, index));

    // Highlight the starting point of the current incomplete polygon
    if (
      this.currentPolygonIndex !== -1 &&
      !this.polygons[this.currentPolygonIndex].completed &&
      this.polygons[this.currentPolygonIndex].points.length > 0
    ) {
      const startPoint = this.polygons[this.currentPolygonIndex].points[0];
      this.ctx.beginPath();
      this.ctx.arc(
        startPoint.x,
        startPoint.y,
        this.POINT_RADIUS + 2,
        0,
        Math.PI * 2
      ); // Slightly larger circle
      this.ctx.fillStyle = this.polygons[this.currentPolygonIndex].color;
      this.ctx.fill();
      this.ctx.strokeStyle = '#FFFFFF'; // White border
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  private drawPolygon(polygon: Polygon, index: number): void {
    const ctx = this.ctx!;
    if (polygon.points.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(polygon.points[0].x, polygon.points[0].y);

    for (let i = 1; i < polygon.points.length; i++) {
      ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
    }

    // Close the path if the polygon is marked as completed
    if (polygon.completed && polygon.points.length > 2) {
      ctx.closePath(); // Draws the line back to the start
    }

    // Style and draw the polygon lines
    ctx.strokeStyle = polygon.color;
    ctx.lineWidth = 4; // Increased line thickness
    ctx.stroke();

    // Draw points (vertices)
    polygon.points.forEach((point, pIndex) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.POINT_RADIUS, 0, Math.PI * 2); // Circle radius uses updated POINT_RADIUS
      ctx.fillStyle = polygon.color; // Fill the points
      // Optionally different style for active polygon points
      // if(index === this.currentPolygonIndex && !polygon.completed) ctx.fillStyle = 'yellow';
      ctx.fill();
    });
  }

  // --- History Management ---

  private pushUndoState(): void {
    // Deep clone the current state
    this.undoStack.push(
      JSON.parse(
        JSON.stringify({
          polygons: this.polygons,
          currentPolygonIndex: this.currentPolygonIndex,
          nextPolygonId: this.nextPolygonId,
        })
      )
    );
    // Limit undo stack size (optional)
    // const MAX_UNDO = 50;
    // if (this.undoStack.length > MAX_UNDO) {
    //   this.undoStack.shift();
    // }
  }

  private pushRedoState(): void {
    // Deep clone the current state for redo
    this.redoStack.push(
      JSON.parse(
        JSON.stringify({
          polygons: this.polygons,
          currentPolygonIndex: this.currentPolygonIndex,
          nextPolygonId: this.nextPolygonId,
        })
      )
    );
  }

  private restoreState(state: any): void {
    this.polygons = state.polygons;
    this.currentPolygonIndex = state.currentPolygonIndex;
    this.nextPolygonId = state.nextPolygonId;
    this.draw();
    this.cdr.markForCheck(); // Important after state restoration
  }

  public undo(): void {
    if (this.undoStack.length > 0) {
      this.pushRedoState(); // Save current state to redo stack FIRST
      const previousState = this.undoStack.pop();
      this.restoreState(previousState);
    }
  }

  public redo(): void {
    if (this.redoStack.length > 0) {
      this.pushUndoState(); // Save current state to undo stack FIRST
      const nextState = this.redoStack.pop();
      this.restoreState(nextState);
    }
  }

  // --- Reset and Deletion ---

  private resetCanvasState(): void {
    // Only resets polygon/drawing state, not the underlying image object
    this.polygons = [];
    this.undoStack = [];
    this.redoStack = [];
    this.currentPolygonIndex = -1;
    this.nextPolygonId = 0;
    this.isDrawingEnabled = false; // Turn off drawing on reset
    if (this.ctx && this.canvas?.nativeElement) {
      this.ctx.clearRect(
        0,
        0,
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height
      );
    }
  }

  public reset(): void {
    // Full reset: clears NgRx state and canvas state
    this.pushUndoState(); // Allow undoing the reset
    this.resetCanvasState();
    this.image = undefined; // Clear the image object
    if (this.canvas?.nativeElement) {
      // Reset canvas dimensions if needed, or clear it
      this.canvas.nativeElement.width = 0;
      this.canvas.nativeElement.height = 0;
    }
    this.store.dispatch(ImageActions.clearImage());
    this.store.dispatch(chatActions.clearMessages()); // Assuming this is related
    this.cdr.markForCheck();
  }

  public deletePolygon(index: number): void {
    if (index >= 0 && index < this.polygons.length) {
      this.pushUndoState();
      if (index === this.currentPolygonIndex) {
        this.currentPolygonIndex = -1; // Stop drawing if deleting the current one
      } else if (index < this.currentPolygonIndex) {
        this.currentPolygonIndex--; // Adjust index if deleting before current
      }
      this.polygons.splice(index, 1);
      this.redoStack = [];
      this.draw();
      this.cdr.markForCheck();
    }
  }

  public deleteAllPolygons(): void {
    if (this.polygons.length > 0) {
      this.pushUndoState();
      this.polygons = [];
      this.currentPolygonIndex = -1;
      this.redoStack = [];
      this.draw();
      this.cdr.markForCheck();
    }
  }

  // --- Utility ---

  private getColor(index: number): string {
    return this.COLORS[index % this.COLORS.length];
  }

  // --- Export ---

  public getAnnotatedImage(): string | null {
    if (!this.image || !this.canvas?.nativeElement) return null;

    // Create a temporary canvas to draw the final image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.image.naturalWidth;
    tempCanvas.height = this.image.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return null;

    // Draw the original image
    tempCtx.drawImage(this.image, 0, 0, tempCanvas.width, tempCanvas.height);

    // Draw only *completed* polygons onto the temporary canvas
    const completedPolygons = this.polygons.filter((p) => p.completed);
    completedPolygons.forEach((polygon) => {
      if (polygon.points.length === 0) return;

      tempCtx.beginPath();
      tempCtx.moveTo(polygon.points[0].x, polygon.points[0].y);
      for (let i = 1; i < polygon.points.length; i++) {
        tempCtx.lineTo(polygon.points[i].x, polygon.points[i].y);
      }
      tempCtx.closePath(); // Ensure completed polygons are closed shapes

      tempCtx.strokeStyle = polygon.color;
      tempCtx.lineWidth = 2; // Adjust line width as needed for export
      tempCtx.stroke();
    });

    // Return the annotated image as a data URL
    return tempCanvas.toDataURL('image/png'); // Or 'image/jpeg'
  }

  // --- Template Accessors ---
  get isUndoable(): boolean {
    return this.undoStack.length > 0;
  }
  get isRedoable(): boolean {
    return this.redoStack.length > 0;
  }
  get canCompletePolygon(): boolean {
    return (
      this.currentPolygonIndex !== -1 &&
      !this.polygons[this.currentPolygonIndex]?.completed &&
      (this.polygons[this.currentPolygonIndex]?.points.length ?? 0) >= 3
    );
  }
  get hasPolygons(): boolean {
    return this.polygons.length > 0;
  }
  get hasImage(): boolean {
    return !!this.image;
  }
}
