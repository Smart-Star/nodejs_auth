import { TASK_STATUS } from "../utils/constants";

export type Task = {
  id: string;
  title: string;
  status: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
};

export type DBTaskRow = Task;

export type AdminTaskListQuery = {
  search?: string;
  status: string;
};

export type AdminTaskListFilters = {
  search?: string;
  status?: string;
};

export type AdminTaskListResponse = {
  tasks: Task[];
};

export type TaskStatus = (typeof TASK_STATUS)[number];
