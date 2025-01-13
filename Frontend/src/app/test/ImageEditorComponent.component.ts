import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-editor',
  templateUrl: './ImageEditorComponent.component.html',
  styleUrls: ['./ImageEditorComponent.component.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class ImageEditorComponentI implements OnInit {
  @ViewChild('canvas', { static: true }) canvas?: ElementRef;
  ctx?: CanvasRenderingContext2D;
  imageUrl: string = '';
  image?: HTMLImageElement;
  points: number[][][] = [[]]; // Array of points for multiple polygons
  activePolygon: number = 0;
  undoStack: number[][][][] = [];
  redoStack: number[][][][] = [];
  isDrawingEnabled: boolean = false;

  ngOnInit(): void {
    this.ctx = this.canvas?.nativeElement.getContext('2d');
  }

  toggleDrawing(): void {
    this.isDrawingEnabled = !this.isDrawingEnabled;
  }

  uploadImage(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        this.image = new Image();
        this.image.src = this.imageUrl;
        this.image.onload = () => this.draw();
      };
      reader.readAsDataURL(file);
    }
  }

  startDrawing(event: MouseEvent): void {
    if (!this.image || !this.isDrawingEnabled) return;

    const rect = this.canvas?.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const points = this.points[this.activePolygon];
    points.push([Math.round(x), Math.round(y)]);

    this.draw();
  }

  stopDrawing(): void {
    if (this.isDrawingEnabled) {
      this.undoStack.push(
        this.points.map((polygon) => polygon.map((point) => [...point]))
      );
      this.redoStack = [];
    }
  }

  draw(): void {
    if (!this.image) return;

    // Clear the canvas
    this.ctx?.clearRect(
      0,
      0,
      this.canvas?.nativeElement.width,
      this.canvas?.nativeElement.height
    );

    // Draw the image
    this.ctx?.drawImage(
      this.image,
      0,
      0,
      this.canvas?.nativeElement.width,
      this.canvas?.nativeElement.height
    );

    // Draw polygons and vertices
    this.points.forEach((polygon, idx) => {
      if (polygon.length > 0) {
        this.ctx?.beginPath();
        this.ctx?.moveTo(polygon[0][0], polygon[0][1]);
        for (let i = 1; i < polygon.length; i++) {
          this.ctx?.lineTo(polygon[i][0], polygon[i][1]);
        }
        this.ctx?.closePath();
        if (this.ctx) {
          this.ctx.strokeStyle = this.getRandomColor(idx);
          this.ctx.lineWidth = 2;
          this.ctx?.stroke();
        }

        // Draw hollow circles at vertices
        polygon.forEach(([x, y]) => {
          this.ctx?.beginPath();
          this.ctx?.arc(x, y, 5, 0, 2 * Math.PI);
          if (this.ctx) {
            this.ctx.strokeStyle = this.getRandomColor(idx);
          }
          this.ctx?.stroke();
        });
      }
    });
  }

  getAnnotatedImage(): string | void {
    if (this.canvas) {
      console.log(this.canvas.nativeElement.toDataURL('image/png'));
      return this.canvas.nativeElement.toDataURL('image/png');
    }
  }

  undo(): void {
    if (this.undoStack.length > 0) {
      const lastState = this.undoStack.pop();
      if (lastState) {
        this.redoStack.push(
          this.points.map((polygon) => polygon.map((point) => [...point]))
        );
        this.points = lastState;
        this.draw();
      }
    }
  }

  redo(): void {
    if (this.redoStack.length > 0) {
      const lastState = this.redoStack.pop();
      if (lastState) {
        this.undoStack.push(this.points.map((polygon) => [...polygon]));
        this.points = lastState;
        this.draw();
      }
    }
  }

  reset(): void {
    this.points = [[]];
    this.undoStack = [];
    this.redoStack = [];
    this.draw();
  }

  private getRandomColor(idx: number): string {
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#FF33A1',
      '#57FF33',
      '#FF9A33',
    ];
    return colors[idx % colors.length];
  }
}
