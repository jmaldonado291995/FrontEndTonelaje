import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { UiFeedbackService } from '../../../services/ui-feedback.service';

@Component({
  selector: 'app-loader-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader-overlay.html',
  styleUrl: './loader-overlay.scss'
})
export class LoaderOverlayComponent {
  private readonly uiFeedbackService = inject(UiFeedbackService);

  readonly isLoading = computed(() => this.uiFeedbackService.isLoading());
}
