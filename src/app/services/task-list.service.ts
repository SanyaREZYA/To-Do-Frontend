import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaskList } from '../models/TaskList';
import { Observable } from 'rxjs';
import { TaskListDto } from '../models/dtos/task-list.dto';

@Injectable({
  providedIn: 'root',
})
export class TaskListService {
  private apiUrl = 'http://localhost:5209/api/TaskList';

  constructor(private http: HttpClient) {}

  getAllTaskListByUser(): Observable<TaskList[]> {
    return this.http.get<TaskList[]>(`${this.apiUrl}/all`);
  }

  createTaskList(name: string): Observable<TaskList> {
    return this.http.post<TaskList>(this.apiUrl, { name });
  }

  deleteTaskList(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateTaskList(id: number, taskListDto: TaskListDto): Observable<TaskList> {
    return this.http.put<TaskList>(`${this.apiUrl}/${id}`, taskListDto);
  }
}
