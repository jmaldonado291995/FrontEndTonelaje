import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { UiFeedbackService } from '../../../services/ui-feedback.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.scss'
})
export class ErrorModalComponent {
  private readonly uiFeedbackService = inject(UiFeedbackService);

  readonly modalState = computed(() => this.uiFeedbackService.errorModal());

  close(): void {
    this.uiFeedbackService.closeErrorModal();
  }
}
