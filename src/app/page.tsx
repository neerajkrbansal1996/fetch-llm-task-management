'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import KanbanBoard from './components/KanbanBoard'
import TaskEditModal from './components/TaskEditModal'
import AnimatedGrid from './components/ui/AnimatedGrid'
import { useTasks } from '@/hooks/useTasks'
import { Task } from '@/types/task'

export default function Home() {
  const { tasks, loading, updateTaskStatus, updateTask, deleteTask } = useTasks()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <AnimatedGrid />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full"></div>
              </motion.div>
            </div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              onTaskUpdate={updateTaskStatus}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
            />
          )}
        </motion.div>

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
