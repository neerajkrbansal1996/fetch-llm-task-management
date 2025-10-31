'use client'

import { useState, useEffect } from 'react'
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
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/types/task'
import TaskCard from './TaskCard'

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })

  return <div ref={setNodeRef}>{children}</div>
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
  const [tasksByStatus, setTasksByStatus] = useState<Record<TaskStatus, Task[]>>({
    todo: [],
    'in-progress': [],
    done: [],
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    }

    tasks.forEach((task) => {
      grouped[task.status].push(task)
    })

    setTasksByStatus(grouped)
  }, [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string
    const task = tasks.find((t) => t.id === taskId)
    setActiveTask(task || null)
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
  }

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => {
            const columnTasks = tasksByStatus[column.id]

            return (
              <div key={column.id} className="flex flex-col">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {column.title}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {columnTasks.length} task{columnTasks.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <DroppableColumn id={column.id}>
                  <div
                    className="min-h-[200px] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700"
                  >
                    <SortableContext
                      items={columnTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {columnTasks.length === 0 ? (
                          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                            No tasks
                          </p>
                        ) : (
                          columnTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onEdit={onTaskEdit}
                              onDelete={onTaskDelete}
                            />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </DroppableColumn>
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-50">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

