'use client'

import { Task } from '@/types/task'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
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
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
          </button>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="Edit task"
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
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label="Delete task"
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
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${priorityColors[task.priority]}`}
        >
          {task.priority.toUpperCase()}
        </span>
        {task.assignee && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            @{task.assignee}
          </span>
        )}
      </div>
    </div>
  )
}

