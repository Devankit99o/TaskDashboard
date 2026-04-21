import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Task, TaskFormData, TaskStatus } from '../types/task'

const STORAGE_KEY = 'task-dashboard-items'

interface TasksState {
  tasks: Task[]
}

const parseStoredTasks = (): Task[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as Task[]
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
  } catch {
    return []
  }
}

const initialState: TasksState = {
  tasks: parseStoredTasks(),
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<TaskFormData>) => {
      state.tasks.unshift({
        id: crypto.randomUUID(),
        status: 'Pending',
        createdAt: new Date().toISOString(),
        ...action.payload,
      })
    },
    updateTask: (
      state,
      action: PayloadAction<{ id: string; updates: TaskFormData }>,
    ) => {
      const item = state.tasks.find((task) => task.id === action.payload.id)
      if (!item) {
        return
      }

      item.title = action.payload.updates.title
      item.description = action.payload.updates.description
      item.priority = action.payload.updates.priority
      item.dueDate = action.payload.updates.dueDate
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload)
    },
    setTaskStatus: (
      state,
      action: PayloadAction<{ id: string; status: TaskStatus }>,
    ) => {
      const item = state.tasks.find((task) => task.id === action.payload.id)
      if (!item) {
        return
      }
      item.status = action.payload.status
    },
    reorderTasks: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>,
    ) => {
      const { fromIndex, toIndex } = action.payload
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.tasks.length ||
        toIndex >= state.tasks.length ||
        fromIndex === toIndex
      ) {
        return
      }
      const [moved] = state.tasks.splice(fromIndex, 1)
      state.tasks.splice(toIndex, 0, moved)
    },
  },
})

export const { addTask, updateTask, deleteTask, setTaskStatus, reorderTasks } =
  tasksSlice.actions

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export default tasksSlice.reducer
