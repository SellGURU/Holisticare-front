"use server"

// Types
export type QuestionType =
  | "paragraph"
  | "multiple_choice"
  | "checkbox"
  | "scale"
  | "star_rating"
  | "emojis"
  | "file_uploader"
  | "yes_no"

export interface SurveyQuestion {
  id?: string
  text: string
  type: QuestionType
  options?: string[] | null
  required: boolean
  response?: string
}

// Update the Survey interface to match the new API response structure
export interface Survey {
  id: string | number
  title: string
  description: string
  questions: SurveyQuestion[]
  public_link?: string
  creator_id?: number
  creator_type?: string
  created_at?: string
  updated_at?: string
  questions_count?: number
  creator?: {
    id: number
    name: string
    email: string
    type: string
  }
}

export interface SurveyAssignment {
  id: string
  surveyId: string
  clientId: string
  assignedDate: string
  dueDate?: string
  status: "not_started" | "in_progress" | "completed"
  uniqueCode: string
  completedDate?: string
  responses?: Record<number, string | string[]>
}

// Mock data
let mockSurveys: Survey[] = [
  {
    id: "1",
    title: "Initial Health Assessment",
    description: "Please complete this survey to help us understand your current health status and goals.",
    questions: [
      {
        id: "question1",
        text: "What are your primary health goals?",
        type: "paragraph",
        required: true,
        response: "",
      },
      {
        id: "question2",
        text: "How would you rate your current energy levels?",
        type: "multiple_choice",
        options: ["Very low", "Low", "Moderate", "High", "Very high"],
        required: true,
        response: "",
      },
      {
        id: "question3",
        text: "Which of the following symptoms do you experience regularly? (Select all that apply)",
        type: "checkbox",
        options: [
          "Fatigue",
          "Headaches",
          "Digestive issues",
          "Joint pain",
          "Mood swings",
          "Sleep problems",
          "None of the above",
        ],
        required: false,
        response: "",
      },
    ],
    created_at: "2023-04-15T10:30:00Z",
    updated_at: "2023-04-15T10:30:00Z",
  },
  {
    id: "2",
    title: "Nutrition Habits Questionnaire",
    description: "Help us understand your current eating patterns to provide personalized nutrition advice.",
    questions: [
      {
        id: "question1",
        text: "How many meals do you typically eat per day?",
        type: "multiple_choice",
        options: ["1-2", "3", "4-5", "6+"],
        required: true,
        response: "",
      },
      {
        id: "question2",
        text: "Describe your typical breakfast:",
        type: "paragraph",
        required: true,
        response: "",
      },
    ],
    created_at: "2023-05-20T14:15:00Z",
    updated_at: "2023-05-20T14:15:00Z",
  },
]

let mockAssignments: SurveyAssignment[] = [
  {
    id: "1",
    surveyId: "1",
    clientId: "1", // Anthony Perez
    assignedDate: "2023-06-01T09:00:00Z",
    dueDate: "2023-06-08T23:59:59Z",
    status: "completed",
    uniqueCode: "hc-surv-a1b2c3",
    completedDate: "2023-06-03T14:22:10Z",
    responses: {
      1: "I want to manage my diabetes better and lose 15 pounds.",
      2: "Low",
      3: ["Fatigue", "Sleep problems"],
    },
  },
  {
    id: "2",
    surveyId: "2",
    clientId: "1", // Anthony Perez
    assignedDate: "2023-06-15T09:00:00Z",
    dueDate: "2023-06-22T23:59:59Z",
    status: "not_started",
    uniqueCode: "hc-surv-d4e5f6",
  },
]

// Survey CRUD operations
export async function getSurveys(searchQuery?: string) {
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    return mockSurveys.filter(
      (survey) => survey.title.toLowerCase().includes(query) || survey.description.toLowerCase().includes(query),
    )
  }
  return mockSurveys
}

export async function getSurveyById(id: string) {
  return mockSurveys.find((survey) => survey.id === id) || null
}

export async function createSurvey(surveyData: Omit<Survey, "id" | "created_at" | "updated_at">) {
  const newSurvey: Survey = {
    ...surveyData,
    id: `${mockSurveys.length + 1}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockSurveys.push(newSurvey)
  return newSurvey
}

export async function updateSurvey(id: string, surveyData: Partial<Omit<Survey, "id" | "created_at" | "updated_at">>) {
  const index = mockSurveys.findIndex((survey) => survey.id === id)
  if (index === -1) return null

  mockSurveys[index] = {
    ...mockSurveys[index],
    ...surveyData,
    updated_at: new Date().toISOString(),
  }

  return mockSurveys[index]
}

export async function deleteSurvey(id: string) {
  const initialLength = mockSurveys.length
  mockSurveys = mockSurveys.filter((survey) => survey.id !== id)

  // Also delete related assignments
  mockAssignments = mockAssignments.filter((assignment) => assignment.surveyId !== id)

  return initialLength !== mockSurveys.length
}

// Survey assignment operations
export async function getAssignmentsByClientId(clientId: string) {
  return mockAssignments.filter((assignment) => assignment.clientId === clientId)
}

export async function getAssignmentsBySurveyId(surveyId: string) {
  return mockAssignments.filter((assignment) => assignment.surveyId === surveyId)
}

export async function getAssignmentById(id: string) {
  return mockAssignments.find((assignment) => assignment.id === id) || null
}

export async function getAssignmentByUniqueCode(uniqueCode: string) {
  return mockAssignments.find((assignment) => assignment.uniqueCode === uniqueCode) || null
}

export async function createAssignment(data: {
  surveyId: string
  clientId: string
  dueDate?: string
}) {
  // Generate a unique code
  const uniqueCode = `hc-surv-${Math.random().toString(36).substring(2, 8)}`

  const newAssignment: SurveyAssignment = {
    id: `${mockAssignments.length + 1}`,
    surveyId: data.surveyId,
    clientId: data.clientId,
    assignedDate: new Date().toISOString(),
    dueDate: data.dueDate,
    status: "not_started",
    uniqueCode,
  }

  mockAssignments.push(newAssignment)
  return newAssignment
}

export async function updateSurveyAssignmentStatus(
  id: string,
  status: SurveyAssignment["status"],
  responses?: Record<number, string | string[]>,
) {
  const index = mockAssignments.findIndex((assignment) => assignment.id === id)
  if (index === -1) return null

  mockAssignments[index] = {
    ...mockAssignments[index],
    status,
    completedDate: status === "completed" ? new Date().toISOString() : mockAssignments[index].completedDate,
    responses: responses || mockAssignments[index].responses,
  }

  return mockAssignments[index]
}

export async function updateAssignmentByUniqueCode(
  uniqueCode: string,
  status: SurveyAssignment["status"],
  responses?: Record<number, string | string[]>,
) {
  const index = mockAssignments.findIndex((assignment) => assignment.uniqueCode === uniqueCode)
  if (index === -1) return null

  mockAssignments[index] = {
    ...mockAssignments[index],
    status,
    completedDate: status === "completed" ? new Date().toISOString() : mockAssignments[index].completedDate,
    responses: responses || mockAssignments[index].responses,
  }

  return mockAssignments[index]
}

export async function resendSurveyLink(id: string) {
  // In a real app, this would send an email
  const assignment = await getAssignmentById(id)
  if (!assignment) return { success: false, message: "Assignment not found" }

  return {
    success: true,
    message: "Survey link has been resent",
    uniqueCode: assignment.uniqueCode,
  }
}

export async function reassignSurvey(id: string, dueDate?: string) {
  const oldAssignment = await getAssignmentById(id)
  if (!oldAssignment) return null

  // Create a new assignment with the same survey and client
  return createAssignment({
    surveyId: oldAssignment.surveyId,
    clientId: oldAssignment.clientId,
    dueDate,
  })
}

export async function bulkAssignSurvey(surveyId: string, clientIds: string[], dueDate?: string) {
  const assignments = []

  for (const clientId of clientIds) {
    const assignment = await createAssignment({
      surveyId,
      clientId,
      dueDate,
    })
    assignments.push(assignment)
  }

  return assignments
}

export async function submitSurveyResponse(id: string, responses: Record<string, unknown>) {
  try {
    // In a real app, this would update the database
    console.log(`Submitting survey responses for assignment ${id} with: ${JSON.stringify(responses)}`)

    // Revalidate paths that might show this data
    return { success: true }
  } catch (error) {
    console.error("Error submitting survey:", error)
    return { success: false, error: "Failed to submit survey" }
  }
}

export async function submitPublicSurveyResponse(surveyId: string, responses: Record<string, unknown>) {
  try {
    // In a real app, this would save to a database
    console.log(`Submitting public survey responses for survey ${surveyId} with: ${JSON.stringify(responses)}`)

    // For demo purposes, we'll just wait a moment
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Revalidate paths that might show this data
    return { success: true }
  } catch (error) {
    console.error("Error submitting public survey:", error)
    return { success: false, error: "Failed to submit survey" }
  }
}
