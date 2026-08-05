import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-delete-item-modal',
  imports: [],
  templateUrl: './delete-item-modal.component.html',
  styleUrl: './delete-item-modal.component.css',
})
export class DeleteItemModalComponent {
  confirm = output<void>();
  close = output<void>();
  itemName = input.required<string>();
  isTaskListDeleting = input.required<boolean>();

  constructor() {}

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
