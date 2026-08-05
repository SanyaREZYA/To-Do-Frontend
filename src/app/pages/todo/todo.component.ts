import { ChangeDetectorRef, Component, OnInit, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TaskListService } from '../../services/task-list.service';
import { TaskList } from '../../models/TaskList';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TaskItem } from '../../models/TaskItem';
import { PagedResponseDto } from '../../models/dtos/paged-response.dto';
import { GetTasksQueryDto } from '../../models/dtos/get-tasks-query.dto';
import { TaskService } from '../../services/task.service';
import { CreateTaskDto } from '../../models/dtos/create-task.dto';
import { NgClass } from '@angular/common';
import { TaskListDto } from '../../models/dtos/task-list.dto';
import { DeleteItemModalComponent } from './delete-item-modal/delete-item-modal.component';
import { EditTaskModalComponent } from './edit-task-modal/edit-task-modal.component';
import { UpdateTaskDto } from '../../models/dtos/update-task.dto';

@Component({
  selector: 'app-todo',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    DeleteItemModalComponent,
    EditTaskModalComponent,
  ],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css',
})
export class TodoComponent implements OnInit {
  name = localStorage.getItem('name');
  email = localStorage.getItem('email');
  taskLists: TaskList[] = [];
  isCreatingNewTaskList = false;
  isCreatingNewTask = false;
  selectedTaskList: TaskList | null = null;
  pagedResponse?: PagedResponseDto<TaskItem>;
  taskPages: number[] = [];
  currentTaskPage: number = 1;
  isDeleteModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isEditingTaskList: boolean = false;
  isTaskListDeleting: boolean = false;
  deletedItemName: string = '';
  deletedTaskId: number | null = null;
  editedTask: TaskItem | null = null;
  sortBy: string = 'title';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private taskListService: TaskListService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  taskCreateForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl(''),
    dueDate: new FormControl('', {
      nonNullable: true,
    }),
    isImportant: new FormControl(false, {
      nonNullable: true,
    }),
  });

  taskListNameEditForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit() {
    this.getAllTaskListByUser();
  }

  getAllTaskListByUser() {
    this.taskListService.getAllTaskListByUser().subscribe({
      next: (response) => {
        this.taskLists = response;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Помилка отримання списків:', error);
      },
    });
  }

  createTaskList(name: string) {
    if (!name.trim()) {
      return;
    }
    this.taskListService.createTaskList(name).subscribe({
      next: (createdTaskList) => {
        this.taskLists = [...this.taskLists, createdTaskList];
        this.selectedTaskList = createdTaskList;
        this.isCreatingNewTaskList = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  onCreateTaskList() {
    this.isCreatingNewTaskList = true;
    this.cdr.detectChanges();
  }

  onCloseCreateTaskList() {
    this.isCreatingNewTaskList = false;
    this.cdr.detectChanges();
  }

  getPagedResponse(getTasksQueryDto: GetTasksQueryDto) {
    this.taskService.getPagedResponse(getTasksQueryDto).subscribe({
      next: (pagedResponse) => {
        this.pagedResponse = pagedResponse;
        this.taskPages = Array.from({ length: this.pagedResponse?.totalPages ?? 0 }, (_, i) => i);
        this.cdr.detectChanges();
      },
    });
  }

  onSelectTaskList(taskList: TaskList) {
    this.selectedTaskList = taskList;
    const getTasksQueryDto: GetTasksQueryDto = this.formGetTaskQueryDto(
      1,
      this.selectedTaskList.id,
    );
    this.getPagedResponse(getTasksQueryDto);
  }

  loadTasksByPage(selectedPage: number) {
    if (!this.selectedTaskList) {
      return;
    }

    this.currentTaskPage = selectedPage;
    const getTasksQueryDto: GetTasksQueryDto = this.formGetTaskQueryDto(
      selectedPage,
      this.selectedTaskList.id,
    );
    this.getPagedResponse(getTasksQueryDto);
  }

  formGetTaskQueryDto(page: number, taskListId: number, search?: string) {
    return {
      taskListId: taskListId,
      page: page,
      pageSize: 10,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      search: search,
    };
  }

  onChangeIsImportant(taskId: number) {
    this.taskService.changeIsImportant(taskId).subscribe({
      next: (task) => {
        if (this.pagedResponse) {
          this.pagedResponse.items = this.pagedResponse.items.map((t) =>
            t.id === task.id ? task : t,
          );
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  onChangeIsCompleted(taskId: number) {
    this.taskService.changeIsCompleted(taskId).subscribe({
      next: (task) => {
        if (this.pagedResponse) {
          this.pagedResponse.items = this.pagedResponse.items.map((t) =>
            t.id === task.id ? task : t,
          );
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  createTask() {
    if (this.taskCreateForm.invalid || !this.selectedTaskList) {
      return;
    }

    const formData = this.taskCreateForm.getRawValue();
    const createTaskDto: CreateTaskDto = {
      taskListId: this.selectedTaskList?.id,
      title: formData.title,
      description: formData.description || null,
      dueDate: formData.dueDate.toString() || null,
      isImportant: formData.isImportant,
    };

    this.taskService.createTask(createTaskDto).subscribe({
      next: () => {
        this.taskCreateForm.reset({
          title: '',
          description: '',
          dueDate: '',
          isImportant: false,
        });
        if (this.selectedTaskList == null) {
          return;
        }
        this.isCreatingNewTask = false;
        this.onSelectTaskList(this.selectedTaskList);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  onShowTaskCreateForm() {
    this.isCreatingNewTask = true;
    this.cdr.detectChanges();
  }

  onEditTaskListName() {
    this.isEditingTaskList = true;
    this.cdr.detectChanges();
  }

  onCLoseTaskListNameForm() {
    this.isEditingTaskList = false;
    this.cdr.detectChanges();
  }

  updateTaskListName() {
    if (!this.selectedTaskList) {
      return;
    }
    const taskListId = this.selectedTaskList.id;
    const taskListDto: TaskListDto = this.taskListNameEditForm.getRawValue();
    this.taskListService.updateTaskList(taskListId, taskListDto).subscribe({
      next: (updatedTaskList) => {
        this.taskLists = this.taskLists.map((taskList) =>
          taskList.id === taskListId ? updatedTaskList : taskList,
        );
        this.selectedTaskList = updatedTaskList;
        this.isEditingTaskList = false;
        this.taskListNameEditForm.reset({
          name: '',
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  onShowDeleteTaskModal(taskTitle: string, taskId?: number) {
    this.deletedItemName = taskTitle;
    if (taskId) {
      this.deletedTaskId = taskId;
    }
    this.isDeleteModalOpen = true;
    this.cdr.detectChanges();
  }

  onShowDeleteTaskListModal() {
    if (!this.selectedTaskList) {
      return;
    }
    this.isTaskListDeleting = true;
    this.deletedItemName = this.selectedTaskList.name;
    this.isDeleteModalOpen = true;
    this.cdr.detectChanges();
  }

  onShowEditTaskModal(task: TaskItem) {
    this.editedTask = task;
    this.isEditModalOpen = true;
    this.cdr.detectChanges();
  }

  deleteTaskList() {
    if (!this.selectedTaskList) {
      return;
    }
    const taskListId = this.selectedTaskList.id;
    this.taskListService.deleteTaskList(taskListId).subscribe({
      next: () => {
        this.taskLists = this.taskLists.filter((taskList) => taskList.id !== taskListId);
        this.isDeleteModalOpen = false;
        this.selectedTaskList = this.taskLists[0] || null;
        this.onSelectTaskList(this.selectedTaskList);
        this.isTaskListDeleting = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteTask(taskId: number) {
    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        if (this.selectedTaskList == null) {
          return;
        }
        this.isDeleteModalOpen = false;
        this.onSelectTaskList(this.selectedTaskList);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteItem() {
    if (this.isTaskListDeleting) {
      this.deleteTaskList();
    } else if (this.deletedTaskId) {
      this.deleteTask(this.deletedTaskId);
    }
  }

  updateTask(updateTaskDto: UpdateTaskDto) {
    if (!this.editedTask) {
      return;
    }
    this.taskService.updateTask(this.editedTask.id, updateTaskDto).subscribe({
      next: (updatedTask) => {
        if (this.pagedResponse) {
          this.pagedResponse.items = this.pagedResponse.items.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          );
        }
        this.isEditModalOpen = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  onCloseDeleteModal() {
    this.isDeleteModalOpen = false;
    this.isTaskListDeleting = false;
    this.cdr.detectChanges();
  }

  onCloseEditModal() {
    this.isEditModalOpen = false;
    this.cdr.detectChanges();
  }

  onSortChange() {
    if (!this.selectedTaskList) {
      return;
    }
    this.onSelectTaskList(this.selectedTaskList);
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    if (!this.selectedTaskList) {
      return;
    }
    this.onSelectTaskList(this.selectedTaskList);
  }

  onSearchInput(search: string) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadTasksBySearch(search);
    }, 700);
  }

  loadTasksBySearch(search: string) {
    if (!this.selectedTaskList) {
      return;
    }
    this.currentTaskPage = 1;
    const getTasksQueryDto: GetTasksQueryDto = this.formGetTaskQueryDto(
      this.currentTaskPage,
      this.selectedTaskList.id,
      search,
    );
    this.getPagedResponse(getTasksQueryDto);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('email');

    this.router.navigate(['/login']);
  }
}
