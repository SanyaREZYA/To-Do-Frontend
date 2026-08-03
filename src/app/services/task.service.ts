import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskItem } from '../models/TaskItem';
import { CreateTaskDto } from '../models/dtos/create-task.dto';
import { GetTasksQueryDto } from '../models/dtos/get-tasks-query.dto';
import { PagedResponseDto } from '../models/dtos/paged-response.dto';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:5209/api/Task';

  constructor(private http: HttpClient) {}

  getAllTasksByTaskListId(taskListId: number): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(`${this.apiUrl}/list/${taskListId}`);
  }

  createTask(dto: CreateTaskDto): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, dto);
  }

  getPagedResponse(query: GetTasksQueryDto): Observable<PagedResponseDto<TaskItem>> {
    return this.http.get<PagedResponseDto<TaskItem>>(this.apiUrl, {
      params: {
        taskListId: query.taskListId,
        page: query.page,
        pageSize: query.pageSize,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
      },
    });
  }

  changeIsImportant(taskId: number): Observable<TaskItem> {
    return this.http.patch<TaskItem>(`${this.apiUrl}/important`, taskId);
  }

  changeIsCompleted(taskId: number): Observable<TaskItem> {
    return this.http.patch<TaskItem>(`${this.apiUrl}/completed`, taskId);
  }
}
