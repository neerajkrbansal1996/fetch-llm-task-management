'use client'

import { useState } from 'react'
import TranscriptInput from './components/TranscriptInput'
import KanbanBoard from './components/KanbanBoard'
import TaskEditModal from './components/TaskEditModal'
import { useTasks } from '@/hooks/useTasks'
import { Task } from '@/types/task'

export default function Home() {
  const { tasks, loading, fetchTasks, updateTaskStatus, updateTask, deleteTask } = useTasks()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTasksCreated = () => {
    fetchTasks()
  }

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleTaskDelete = async (taskId: string) => {
    await deleteTask(taskId)
  }

  const handleTaskSave = async (taskId: string, updates: Parameters<typeof updateTask>[1]) => {
    await updateTask(taskId, updates)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Fetch LLM
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Task Management Powered by AI
          </p>
        </header>

        <TranscriptInput onTasksCreated={handleTasksCreated} />

        <div className="mt-12">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              onTaskUpdate={updateTaskStatus}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
            />
          )}
        </div>

        <TaskEditModal
          task={editingTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
      </div>
    </div>
  )
}
