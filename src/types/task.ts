export type Priority = 'Low' | 'Medium' | 'High'

export type TaskStatus = 'Pending' | 'Completed'

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  dueDate: string
  status: TaskStatus
  createdAt: string
}

export interface TaskFormData {
  title: string
  description: string
  priority: Priority
  dueDate: string
}
