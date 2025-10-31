import { Anthropic, APIError } from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateTaskInput } from '@/types/task'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Use claude-3-5-sonnet-20240620 or claude-3-opus-20240229 as valid model names
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929'

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Call Claude to extract tasks from transcript
    const prompt = `You are a task extraction assistant. Analyze the following meeting transcript and extract all actionable tasks mentioned.

For each task, provide:
- title: A clear, concise task title
- description: A brief description of what needs to be done
- priority: "high", "medium", or "low" based on urgency and importance
- assignee: The person assigned to the task if mentioned, otherwise null

Return ONLY a valid JSON array of task objects. Do not include any explanatory text, markdown, or code blocks. Example format:
[
  {
    "title": "Review pull request #123",
    "description": "Need to review the changes in PR #123 before merging",
    "priority": "high",
    "assignee": "John"
  },
  {
    "title": "Update documentation",
    "description": "Update the API documentation with new endpoints",
    "priority": "medium",
    "assignee": null
  }
]

Transcript:
${transcript}`

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract the response text
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    if (!responseText) {
      return NextResponse.json(
        { error: 'No response from LLM' },
        { status: 500 }
      )
    }

    // Parse JSON response
    let tasks: CreateTaskInput[]
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      tasks = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse LLM response:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse task extraction result', details: String(parseError) },
        { status: 500 }
      )
    }

    // Validate and create tasks in database
    const createdTasks = await Promise.all(
      tasks.map(async (task) => {
        // Validate required fields
        if (!task.title || typeof task.title !== 'string') {
          throw new Error('Each task must have a valid title')
        }

        return prisma.task.create({
          data: {
            title: task.title.trim(),
            description: task.description?.trim() || null,
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            assignee: task.assignee?.trim() || null,
          },
        })
      })
    )

    return NextResponse.json({
      success: true,
      tasks: createdTasks,
      count: createdTasks.length,
    })
  } catch (error) {
    console.error('Error processing transcript:', error)
    
    // Check if it's an Anthropic API error
    if (error instanceof APIError) {
      if (error.status === 404) {
        return NextResponse.json(
          {
            error: 'Model not found',
            details: `The model "${MODEL}" is not available. Please set ANTHROPIC_MODEL environment variable to a valid model like "claude-3-5-sonnet-20240620" or "claude-3-opus-20240229"`,
          },
          { status: 400 }
        )
      }
      return NextResponse.json(
        {
          error: 'Anthropic API error',
          details: error.message || 'Unknown API error',
        },
        { status: error.status || 500 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'Failed to process transcript',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

