import { Component, input, OnInit, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TaskItem } from '../../../models/TaskItem';
import { UpdateTaskDto } from '../../../models/dtos/update-task.dto';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-edit-task-modal',
  imports: [ReactiveFormsModule, FormsModule, NgClass],
  templateUrl: './edit-task-modal.component.html',
  styleUrl: './edit-task-modal.component.css',
})
export class EditTaskModalComponent implements OnInit {
  close = output<void>();
  taskDto = output<UpdateTaskDto>();
  task = input.required<TaskItem>();

  taskUpdateForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl(''),
    dueDate: new FormControl(''),
  });

  ngOnInit(): void {
    this.taskUpdateForm.patchValue({
      title: this.task().title,
      description: this.task().description,
      dueDate: this.task().dueDate,
    });
  }

  onClose() {
    this.close.emit();
  }

  updateTask() {
    this.taskDto.emit(this.taskUpdateForm.getRawValue());
  }
}
