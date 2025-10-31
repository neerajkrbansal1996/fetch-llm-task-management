export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  assignee: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateTaskInput {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: Priority
  assignee?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: Priority
  assignee?: string | null
}

