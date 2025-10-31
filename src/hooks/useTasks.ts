'use client'

import { useState, useEffect, useCallback } from 'react'
import { Task, TaskStatus, UpdateTaskInput } from '@/types/task'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }

      const updatedTask = await response.json()
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      )
    } catch (err) {
      console.error('Error updating task status:', err)
      throw err
    }
  }, [])

  const updateTask = useCallback(async (taskId: string, updates: UpdateTaskInput) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const updatedTask = await response.json()
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      )
    } catch (err) {
      console.error('Error updating task:', err)
      throw err
    }
  }, [])

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  }, [])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    updateTaskStatus,
    updateTask,
    deleteTask,
  }
}

