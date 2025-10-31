'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/types/task'
import TaskCard from './TaskCard'
import { cn } from '@/lib/utils'

function DroppableColumn({
  id,
  children,
  isOver,
}: {
  id: string
  children: React.ReactNode
  isOver?: boolean
}) {
  const { setNodeRef, isOver: droppableIsOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-all duration-200',
        (isOver || droppableIsOver) && 'scale-[1.02]'
      )}
    >
      {children}
    </div>
  )
}

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, status: TaskStatus) => Promise<void>
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

export default function KanbanBoard({
  tasks,
  onTaskUpdate,
  onTaskEdit,
  onTaskDelete,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeColumn, setActiveColumn] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    }

    tasks.forEach((task) => {
      grouped[task.status].push(task)
    })

    return grouped
  }, [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string
    const task = tasks.find((t) => t.id === taskId)
    setActiveTask(task || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (over && columns.some((col) => col.id === over.id)) {
      setActiveColumn(over.id as string)
    } else {
      setActiveColumn(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id as string
    const task = tasks.find((t) => t.id === taskId)

    if (!task) {
      setActiveTask(null)
      return
    }

    // Check if dropped in a column or another task
    let newStatus: TaskStatus | undefined

    // If dropped on a column container
    if (columns.some((col) => col.id === over.id)) {
      newStatus = over.id as TaskStatus
    } else {
      // If dropped on another task, find which column it belongs to
      const targetTask = tasks.find((t) => t.id === over.id)
      if (targetTask) {
        newStatus = targetTask.status
      }
    }

    if (newStatus && newStatus !== task.status) {
      await onTaskUpdate(taskId, newStatus)
    }

    setActiveTask(null)
    setActiveColumn(null)
  }

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column, index) => {
            const columnTasks = tasksByStatus[column.id]
            const isActive = activeColumn === column.id

            return (
              <motion.div
                key={column.id}
                className="flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                  <motion.div
                    className="mb-4"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {column.title}
                    </h2>
                    <motion.span
                      className="text-sm text-gray-500 dark:text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {columnTasks.length} task{columnTasks.length !== 1 ? 's' : ''}
                    </motion.span>
                  </motion.div>

                  <DroppableColumn id={column.id} isOver={isActive}>
                    <motion.div
                      className={cn(
                        'min-h-[200px] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed transition-all duration-200',
                        isActive
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-700'
                      )}
                      whileHover={{ borderColor: 'rgb(59 130 246 / 0.5)' }}
                    >
                      <SortableContext
                        items={columnTasks.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          <AnimatePresence mode="popLayout">
                            {columnTasks.length === 0 ? (
                              <motion.p
                                key="empty"
                                className="text-sm text-gray-400 dark:text-gray-500 text-center py-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                No tasks
                              </motion.p>
                            ) : (
                              columnTasks.map((task, taskIndex) => (
                                <motion.div
                                  key={task.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: taskIndex * 0.05,
                                  }}
                                >
                                  <TaskCard
                                    task={task}
                                    onEdit={onTaskEdit}
                                    onDelete={onTaskDelete}
                                  />
                                </motion.div>
                              ))
                            )}
                          </AnimatePresence>
                        </div>
                      </SortableContext>
                    </motion.div>
                  </DroppableColumn>
                </motion.div>
            )
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <motion.div
              initial={{ scale: 0.9, rotate: -2 }}
              animate={{ scale: 1, rotate: 2 }}
              transition={{ duration: 0.2 }}
              style={{ opacity: 0.9 }}
            >
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

