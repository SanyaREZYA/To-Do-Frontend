export interface CreateTaskDto {
  taskListId: number;
  title: string;
  description: string | null;
  isImportant: boolean;
  dueDate: string | null;
}
