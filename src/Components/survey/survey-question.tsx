"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface SurveyQuestionProps {
  questionNumber: number
  totalQuestions: number
  question: string
  type: "paragraph" | "multiple_choice" | "checkbox" | "scale" | "star_rating" | "emojis" | "file_uploader" | "yes_no"
  options: string[]
  required: boolean
  initialValue: string | string[]
  onNext: (response: string | string[]) => void
  onPrevious: () => void
}

export function SurveyQuestion({
  questionNumber,
  totalQuestions,
  question,
  type,
  options,
  required,
  initialValue,
  onNext,
  onPrevious,
}: SurveyQuestionProps) {
  // Initialize state with initialValue or default empty value
  const [response, setResponse] = useState<string | string[]>(
    initialValue !== undefined ? initialValue : type === "checkbox" ? [] : "",
  )
  const [error, setError] = useState<string | null>(null)

  // Only update response from initialValue when questionNumber changes
  useEffect(() => {
    const defaultValue = type === "checkbox" ? [] : ""
    setResponse(initialValue !== undefined ? initialValue : defaultValue)
  }, [questionNumber, type]) // Removed initialValue from dependencies to prevent loops

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(e.target.value)
    if (error) setError(null)
  }

  const handleRadioChange = (value: string) => {
    setResponse(value)
    if (error) setError(null)
  }

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setResponse((prev) => {
      if (typeof prev === "string") return checked ? [value] : []

      if (checked) {
        return [...prev, value]
      } else {
        return prev.filter((item) => item !== value)
      }
    })
    if (error) setError(null)
  }

  const handleNext = () => {
    if (required && (!response || (Array.isArray(response) && response.length === 0))) {
      setError("This question requires an answer")
      return
    }
    onNext(response)
  }

  // Calculate gradient colors based on question number
  const getGradientColor = (questionNumber: number, totalQuestions: number) => {
    const progress = questionNumber / totalQuestions

    if (progress < 0.25) {
      return "from-purple-500 to-fuchsia-500"
    } else if (progress < 0.5) {
      return "from-fuchsia-500 to-pink-500"
    } else if (progress < 0.75) {
      return "from-pink-500 to-rose-500"
    } else {
      return "from-rose-500 to-orange-400"
    }
  }

  const gradientClass = getGradientColor(questionNumber, totalQuestions)

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-10">
      <div className="mb-8">
        <div
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${gradientClass} mb-4`}
        >
          Question {questionNumber} of {totalQuestions}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{question}</h2>
        {required && <span className="text-sm text-gray-500 mt-1">* Required</span>}
      </div>

      <div className="space-y-6">
        {type === "paragraph" && (
          <Textarea
            value={response as string}
            onChange={handleTextChange}
            placeholder="Type your answer here..."
            className="min-h-[120px] text-base"
          />
        )}

        {type === "multiple_choice" && (
          <RadioGroup value={response as string} onValueChange={handleRadioChange} className="space-y-3">
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-slate-50 transition-colors"
              >
                <RadioGroupItem value={option} id={`option-${index}`} className="text-purple-600" />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer font-medium">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {type === "checkbox" && (
          <div className="space-y-3">
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-slate-50 transition-colors"
              >
                <Checkbox
                  id={`option-${index}`}
                  checked={Array.isArray(response) && response.includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(option, checked === true)}
                  className="mt-1 text-purple-600"
                />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer font-medium">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )}

        {type === "scale" && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
            <input
              type="range"
              min={options[0] || "1"}
              max={options[1] || "10"}
              value={(response as string) || "5"}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center text-lg font-medium">{response || "5"}</div>
          </div>
        )}

        {type === "star_rating" && (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setResponse((index + 1).toString())}
                className={`text-2xl ${
                  Number(response) > index ? "text-yellow-400" : "text-gray-300"
                } hover:text-yellow-400 transition-colors`}
              >
                ★
              </button>
            ))}
          </div>
        )}

        {type === "emojis" && (
          <div className="flex justify-center space-x-4">
            {options.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setResponse(emoji)}
                className={`text-4xl p-2 rounded-full ${
                  response === emoji ? "bg-purple-100 ring-2 ring-purple-500" : ""
                } hover:bg-purple-50 transition-all`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {type === "file_uploader" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setResponse(e.target.files[0].name)
                  }
                }}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <span className="text-gray-600 font-medium">Click to upload a file</span>
                <span className="text-gray-500 text-sm mt-1">or drag and drop</span>
              </label>
            </div>
            {response && (
              <div className="text-sm text-gray-600">
                Selected file: <span className="font-medium">{response}</span>
              </div>
            )}
          </div>
        )}

        {type === "yes_no" && (
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setResponse("Yes")}
              className={`px-8 py-3 rounded-lg font-medium ${
                response === "Yes" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setResponse("No")}
              className={`px-8 py-3 rounded-lg font-medium ${
                response === "No" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors`}
            >
              No
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="flex justify-between mt-10">
        <Button type="button" variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          className={`flex items-center gap-2 bg-gradient-to-r ${gradientClass} hover:brightness-105 transition-all`}
        >
          {questionNumber === totalQuestions ? "Submit" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
