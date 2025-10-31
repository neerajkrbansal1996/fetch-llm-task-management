'use client'

import { Task } from '@/types/task'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import Card from './ui/Card'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn('cursor-grab active:cursor-grabbing')}
    >
      <Card hover glow className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2 flex-1">
            <motion.button
              {...attributes}
              {...listeners}
              className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 4H3V6H5V4ZM5 7H3V9H5V7ZM5 10H3V12H5V10ZM9 4H7V6H9V4ZM9 7H7V9H9V7ZM9 10H7V12H9V10Z"
                  fill="currentColor"
                />
              </svg>
            </motion.button>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
              aria-label="Edit task"
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.333 2.66667C11.5084 2.49145 11.7163 2.35252 11.9444 2.25884C12.1726 2.16516 12.4162 2.11877 12.662 2.12267C12.9079 2.12657 13.1506 2.18064 13.3756 2.28174C13.6006 2.38284 13.8033 2.52869 13.9707 2.71067C14.1381 2.89265 14.2665 3.10683 14.3482 3.33976C14.4298 3.57269 14.4629 3.81944 14.4453 4.06467C14.4278 4.30989 14.36 4.5486 14.246 4.76467L6.37333 12.6373L2 13.3333L2.696 9.96L10.5687 2.08733L11.333 2.66667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </motion.button>
            <motion.button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
              aria-label="Delete task"
              whileHover={{ scale: 1.1, rotate: -15 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4H14M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0263 12.2761 14.2764C12.026 14.5265 11.6867 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5265 3.72376 14.2764C3.47361 14.0263 3.33333 13.687 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2.31305 5.47361 1.97391 5.72376 1.72376C5.97391 1.47361 6.31305 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47361 10.2762 1.72376C10.5264 1.97391 10.6667 2.31305 10.6667 2.66667V4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <motion.span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded border',
              priorityColors[task.priority]
            )}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {task.priority.toUpperCase()}
          </motion.span>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {task.assignee && (
              <motion.span
                className="text-xs text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                @{task.assignee}
              </motion.span>
            )}
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-400 dark:text-gray-500"
              >
                <path
                  d="M9.5 2H10C10.2652 2 10.5196 2.10536 10.7071 2.29289C10.8946 2.48043 11 2.73478 11 3V10C11 10.2652 10.8946 10.5196 10.7071 10.7071C10.5196 10.8946 10.2652 11 10 11H2C1.73478 11 1.48043 10.8946 1.29289 10.7071C1.10536 10.5196 1 10.2652 1 10V3C1 2.73478 1.10536 2.48043 1.29289 2.29289C1.48043 2.10536 1.73478 2 2 2H2.5M9.5 2V1.5C9.5 1.22386 9.27614 1 9 1H8.5C8.22386 1 8 1.22386 8 1.5V2M9.5 2H2.5M2.5 2V1.5C2.5 1.22386 2.72386 1 3 1H3.5C3.77614 1 4 1.22386 4 1.5V2"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="whitespace-nowrap" title={format(new Date(task.createdAt), 'PPpp')}>
                {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </span>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

