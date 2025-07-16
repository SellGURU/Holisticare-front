"use client"

import { Button } from "../ui/button"
import type { SurveyAssignment } from "../../utils/survey-actions"
import { ArrowRight } from "lucide-react"

interface SurveyLandingProps {
  title: string
  description: string
  onStart: () => void
  status: SurveyAssignment["status"]
}

export function SurveyLanding({ title, description, onStart, status }: SurveyLandingProps) {
  return (
    <div className="w-full max-w-3xl mx-auto text-center space-y-8">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{title}</h1>

      <p className="text-xl text-gray-600 max-w-2xl mx-auto">Please take a moment to complete this survey</p>

      <div className="mt-12 bg-white rounded-2xl shadow-md p-8 max-w-2xl mx-auto">
        <p className="text-lg text-gray-700 leading-relaxed">{description}</p>
      </div>

      <div className="pt-8">
        <Button
          onClick={onStart}
          size="lg"
          className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl group"
        >
          {status === "not_started"
            ? "Get Started Now"
            : status === "in_progress"
              ? "Continue Survey"
              : "Review Survey"}
          <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
