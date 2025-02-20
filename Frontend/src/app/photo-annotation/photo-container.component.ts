import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import * as ImageActions from '../+state/image/image.actions';
import * as ImageSelectors from '../+state/image/image.selectors';
import { ImageState } from '../+state/image/image.state';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
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
    ScrollPanelModule,
    TooltipModule,
  ],
  templateUrl: './photo-container.component.html',
  styleUrls: ['./photo-container.component.scss'],
})
export class PhotoContainerComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private store = inject(Store<{ image: ImageState }>);
  public ctx?: CanvasRenderingContext2D;
  public imageUrl: string = '';
  public image?: HTMLImageElement;
  public polygons: Polygon[] = [];
  public activePolygonIndex: number = 0;
  public undoStack: Polygon[][] = [];
  public redoStack: Polygon[][] = [];
  public isDrawingEnabled: boolean = false;
  public currentPolygonPoints: Point[] = [];
  public imageUrl$ = this.store.select(ImageSelectors.selectBase64Image);

  ngOnInit(): void {
    this.ctx = this.canvas?.nativeElement.getContext('2d') ?? undefined;

    // Subscribe to image changes
    this.imageUrl$.subscribe((base64Image) => {
      if (base64Image) {
        this.imageUrl = base64Image;
        this.image = new Image();
        this.image.src = base64Image;
        this.image.onload = () => this.draw();
      }
    });
  }

  public triggerFileInput(): void {
    this.fileInput?.nativeElement.click();
  }

  public toggleDrawing(): void {
    this.isDrawingEnabled = !this.isDrawingEnabled;
  }

  public uploadImage(event: Event): void {
    if (this.image) {
      this.reset();
    }
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        this.store.dispatch(ImageActions.setImage({ base64Image }));
      };
      reader.readAsDataURL(file);
      target.value = '';
    }
  }

  private getDistanceToPoint(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private findNearestPoint(newPoint: Point, points: Point[]): number {
    if (points.length === 0) return -1;

    let minDistance = Infinity;
    let nearestIndex = -1;

    points.forEach((point, index) => {
      const distance = this.getDistanceToPoint(newPoint, point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    // Only connect if point is close enough (threshold of 15 pixels)
    return minDistance < 15 ? nearestIndex : -1;
  }

  public handleCanvasClick(event: MouseEvent): void {
    if (!this.isDrawingEnabled || !this.image) return;

    const { offsetX: x, offsetY: y } = event;
    const newPoint = { x, y };

    const activePolygon =
      this.polygons[this.activePolygonIndex] ?? this.createPolygon();

    if (activePolygon.points.length > 0) {
      const nearestIndex = this.findNearestPoint(
        newPoint,
        activePolygon.points
      );

      if (nearestIndex !== -1) {
        // Reorder points to create a polygon
        const reorderedPoints: Point[] = [];
        const usedIndices = new Set<number>();

        // Start with the new point
        reorderedPoints.push(newPoint);

        while (reorderedPoints.length < activePolygon.points.length + 1) {
          const currentPoint = reorderedPoints[reorderedPoints.length - 1];
          let nextNearestIndex = -1;
          let minDistance = Infinity;

          // Find the nearest unused point
          activePolygon.points.forEach((point, index) => {
            if (!usedIndices.has(index)) {
              const distance = this.getDistanceToPoint(currentPoint, point);
              if (distance < minDistance) {
                minDistance = distance;
                nextNearestIndex = index;
              }
            }
          });

          if (nextNearestIndex !== -1) {
            reorderedPoints.push(activePolygon.points[nextNearestIndex]);
            usedIndices.add(nextNearestIndex);
          }
        }

        activePolygon.points = reorderedPoints;
      } else {
        // If not near any point, just add to the end
        activePolygon.points.push(newPoint);
      }
    } else {
      // First point of the polygon
      activePolygon.points.push(newPoint);
    }

    this.pushUndoState();
    this.draw();
  }

  public draw(): void {
    if (!this.ctx || !this.image) return;

    this.clearCanvas(); // Clear canvas before drawing
    this.ctx.drawImage(
      this.image,
      0,
      0,
      this.canvas!.nativeElement.width,
      this.canvas!.nativeElement.height
    );

    this.polygons.forEach((polygon, index) => this.drawPolygon(polygon, index));
    this.getAnnotatedImage();
  }

  private drawPolygon(polygon: Polygon, index: number): void {
    const ctx = this.ctx!;
    if (polygon.points.length === 0) return;

    // Draw lines
    ctx.beginPath();
    ctx.moveTo(polygon.points[0].x, polygon.points[0].y);

    for (let i = 1; i < polygon.points.length; i++) {
      ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
    }

    if (polygon.points.length > 2) {
      ctx.lineTo(polygon.points[0].x, polygon.points[0].y);
    }

    ctx.strokeStyle = polygon.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw hollow points
    polygon.points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.strokeStyle = polygon.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  public getAnnotatedImage() {}

  public undo(): void {
    if (this.undoStack.length > 0) {
      this.pushRedoState(); // Save current state to redoStack
      this.polygons = this.undoStack.pop()!; // Restore the last state
      this.currentPolygonPoints = []; // Clear current polygon points
      this.draw();
    }
  }

  public redo(): void {
    if (this.redoStack.length > 0) {
      this.pushUndoState(); // Save current state to undoStack
      this.polygons = this.redoStack.pop()!; // Restore the next state
      this.draw();
    }
  }

  public reset(): void {
    this.pushUndoState();
    this.polygons = [];
    this.undoStack = [];
    this.redoStack = [];
    this.image = undefined;
    this.store.dispatch(ImageActions.clearImage());
    this.clearCanvas();
  }

  private pushUndoState(): void {
    this.undoStack.push(JSON.parse(JSON.stringify(this.polygons)));
  }

  private pushRedoState(): void {
    this.redoStack.push(JSON.parse(JSON.stringify(this.polygons)));
  }

  private createPolygon(): Polygon {
    const newPolygon = {
      points: [],
      color: this.getRandomColor(this.polygons.length),
      completed: false,
    };
    this.polygons.push(newPolygon);
    this.activePolygonIndex = this.polygons.length - 1;
    return newPolygon;
  }

  public getRandomColor(index: number): string {
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#FF33A1',
      '#57FF33',
      '#FF9A33',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private clearCanvas(): void {
    const canvas = this.canvas!.nativeElement;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    }
  }

  public clearCurrentPolygon(): void {
    if (this.currentPolygonPoints.length) {
      this.pushUndoState();
      this.currentPolygonPoints = [];
      this.draw();
    }
  }

  public completePolygon(): void {
    if (this.currentPolygonPoints.length >= 3) {
      this.pushUndoState();
      this.polygons.push({
        points: [...this.currentPolygonPoints],
        color: this.getRandomColor(this.polygons.length),
        completed: true,
      });
      this.currentPolygonPoints = [];
      this.draw();
    }
  }

  public deletePolygon(index: number): void {
    this.pushUndoState();
    this.polygons.splice(index, 1);
    this.draw();
  }

  public deleteAllPolygons(): void {
    if (this.polygons.length) {
      this.pushUndoState();
      this.polygons = [];
      this.currentPolygonPoints = [];
      this.draw();
    }
  }
}
