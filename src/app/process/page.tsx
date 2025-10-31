'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import TranscriptInput from '../components/TranscriptInput'
import AnimatedGrid from '../components/ui/AnimatedGrid'

export default function ProcessPage() {
  const router = useRouter()

  const handleTasksCreated = () => {
    // Redirect to dashboard after tasks are created
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <AnimatedGrid />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <TranscriptInput onTasksCreated={handleTasksCreated} />
        </motion.div>
      </div>
    </div>
  )
}

