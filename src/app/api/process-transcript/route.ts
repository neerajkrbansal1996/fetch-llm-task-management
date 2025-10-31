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
        { error: 'Input is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Call Claude to generate tasks for Fetch LLM project
    const prompt = `You are an intelligent project management assistant for the Fetch LLM project. Analyze the following input (which could be a project description, meeting notes, requirements, feature specifications, or any project-related information) and generate a comprehensive list of actionable tasks specifically for the Fetch LLM project.

The Fetch LLM project is a task management application that uses AI (LLM) to extract and manage tasks. Keep this context in mind when generating tasks.

Your goal is to break down the Fetch LLM project requirements into manageable, actionable tasks. Think about:
- All the steps needed to complete the Fetch LLM project features or requirements
- Dependencies between tasks
- The logical sequence of work
- Technical requirements and implementation details specific to Fetch LLM
- LLM integration, API development, database design, UI/UX improvements
- Documentation and testing needs for Fetch LLM
- Deployment and release tasks

For each task, provide:
- title: A clear, concise task title that describes what needs to be done for Fetch LLM
- description: A detailed description of what needs to be accomplished, including any relevant context or requirements specific to Fetch LLM
- priority: "high" (critical/urgent), "medium" (important but not urgent), or "low" (nice to have) based on urgency, importance, and dependencies
- assignee: The person assigned to the task if mentioned in the input, otherwise null

Return ONLY a valid JSON array of task objects. Do not include any explanatory text, markdown, or code blocks. Example format:
[
  {
    "title": "Set up Fetch LLM project repository and initial structure",
    "description": "Create the Fetch LLM project repository, initialize with proper folder structure, set up version control, and configure development environment",
    "priority": "high",
    "assignee": null
  },
  {
    "title": "Design database schema for Fetch LLM tasks",
    "description": "Design and document the database schema including all tables, relationships, and indexes required for the Fetch LLM task management system",
    "priority": "high",
    "assignee": null
  },
  {
    "title": "Implement LLM integration for task extraction",
    "description": "Integrate LLM API (Claude/Anthropic) to extract tasks from project descriptions and meeting notes for Fetch LLM",
    "priority": "medium",
    "assignee": null
  },
  {
    "title": "Write API documentation for Fetch LLM",
    "description": "Document all Fetch LLM API endpoints with request/response examples, authentication requirements, and error codes",
    "priority": "low",
    "assignee": null
  }
]

Fetch LLM Project Input:
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
    console.error('Error processing input:', error)
    
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
        error: 'Failed to process input and generate tasks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

