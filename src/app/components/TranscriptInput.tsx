'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import Card from './ui/Card'

interface TranscriptInputProps {
  onTasksCreated: () => void
}

export default function TranscriptInput({ onTasksCreated }: TranscriptInputProps) {
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!transcript.trim()) {
      setError('Please enter Fetch LLM project description or input')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/process-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process transcript')
      }

      setSuccess(`Successfully generated ${data.count} task${data.count !== 1 ? 's' : ''} for Fetch LLM project!`)
      setTranscript('')
      onTasksCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <Card hover glow className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="e.g., meeting notes, feature requirements, bug reports, project updates, or any input related to Fetch LLM project..."
            className="h-64"
            disabled={loading}
            error={error || undefined}
          />

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={loading || !transcript.trim()}
            isLoading={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Generating tasks...' : 'Generate Tasks'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

