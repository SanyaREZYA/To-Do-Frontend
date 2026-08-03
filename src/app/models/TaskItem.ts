export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  isImportant: boolean;
  isCompleted: boolean;
  dueDate?: string;
  taskListId: number;
}
