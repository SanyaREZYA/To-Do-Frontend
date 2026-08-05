export interface GetTasksQueryDto {
  taskListId: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
  search?: string;
}
