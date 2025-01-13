import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Card } from 'primeng/card';
import { Panel } from 'primeng/panel';
import { FileUpload } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-photo-container',
  imports: [CommonModule, Card, Panel, FileUpload, ButtonModule],
  templateUrl: './photo-container.component.html',
  styleUrl: './photo-container.component.scss',
})
export class PhotoContainerComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public imageUrl: string | ArrayBuffer | null = null;

  public triggerFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  public onFileClear(): void {
    this.imageUrl = null;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
