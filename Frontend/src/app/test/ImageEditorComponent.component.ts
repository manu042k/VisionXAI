import { CommonModule, NgIf } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Card } from 'primeng/card';
import { Panel } from 'primeng/panel';
import { FileUpload } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  points: Point[];
}

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss'],
  imports: [CommonModule, Card, Panel, FileUpload, ButtonModule, NgIf],
  standalone: true,
})
export class ImageEditorComponentI implements OnInit {
  @ViewChild('canvas', { static: true }) canvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  ctx?: CanvasRenderingContext2D;
  imageUrl: string = '';
  image?: HTMLImageElement;
  polygons: Polygon[] = [];
  activePolygonIndex: number = 0;
  undoStack: Polygon[][] = [];
  redoStack: Polygon[][] = [];
  isDrawingEnabled: boolean = false;

  ngOnInit(): void {
    this.ctx = this.canvas?.nativeElement.getContext('2d') ?? undefined;
  }

  triggerFileInput(): void {
    this.fileInput?.nativeElement.click();
  }

  toggleDrawing(): void {
    this.isDrawingEnabled = !this.isDrawingEnabled;
  }

  uploadImage(event: Event): void {
    if (this.image) {
      this.reset(); // Reset the canvas before uploading a new image
    }
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
        this.image = new Image();
        this.image.src = this.imageUrl;
        this.image.onload = () => this.draw();
      };
      reader.readAsDataURL(file);
    }
  }

  handleCanvasClick(event: MouseEvent): void {
    if (!this.isDrawingEnabled || !this.image) return;

    const { offsetX: x, offsetY: y } = event;
    const activePolygon =
      this.polygons[this.activePolygonIndex] ?? this.createPolygon();
    activePolygon.points.push({ x, y });

    this.pushUndoState();
    this.draw();
  }

  draw(): void {
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
  }

  private drawPolygon(polygon: Polygon, index: number): void {
    const ctx = this.ctx!;
    if (polygon.points.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
    polygon.points.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.closePath();

    ctx.strokeStyle = this.getRandomColor(index);
    ctx.lineWidth = 2;
    ctx.stroke();

    polygon.points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  getAnnotatedImage(): string | void {
    return this.canvas?.nativeElement.toDataURL('image/png');
  }

  undo(): void {
    if (this.undoStack.length > 0) {
      this.pushRedoState(); // Save current state to redoStack
      this.polygons = this.undoStack.pop()!; // Restore the last state
      this.draw();
    }
  }

  redo(): void {
    if (this.redoStack.length > 0) {
      this.pushUndoState(); // Save current state to undoStack
      this.polygons = this.redoStack.pop()!; // Restore the next state
      this.draw();
    }
  }

  reset(): void {
    this.pushUndoState(); // Save current state for undo
    this.polygons = [];
    this.undoStack = [];
    this.redoStack = [];
    this.image = undefined; // Clear the image

    this.clearCanvas();
  }

  private pushUndoState(): void {
    this.undoStack.push(JSON.parse(JSON.stringify(this.polygons)));
  }

  private pushRedoState(): void {
    this.redoStack.push(JSON.parse(JSON.stringify(this.polygons)));
  }

  private createPolygon(): Polygon {
    const newPolygon = { points: [] };
    this.polygons.push(newPolygon);
    this.activePolygonIndex = this.polygons.length - 1;
    return newPolygon;
  }

  private getRandomColor(index: number): string {
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#FF33A1',
      '#57FF33',
      '#FF9A33',
    ];
    return colors[index % colors.length];
  }

  private clearCanvas(): void {
    const canvas = this.canvas!.nativeElement;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    }
  }
}
