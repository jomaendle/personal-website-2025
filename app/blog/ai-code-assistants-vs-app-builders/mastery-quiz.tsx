"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; weight: number }[];
}

interface MasteryResult {
  level: string;
  score: number;
  description: string;
  nextSteps: string[];
  timeToNext: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "current_usage",
    question: "Which best describes your current AI tool usage?",
    options: [
      {
        value: "none",
        label: "I rarely or never use AI coding tools",
        weight: 0,
      },
      {
        value: "basic",
        label: "I use GitHub Copilot or ChatGPT occasionally",
        weight: 1,
      },
      {
        value: "regular",
        label: "I use multiple AI tools regularly in my workflow",
        weight: 2,
      },
      {
        value: "advanced",
        label: "I strategically orchestrate multiple AI systems",
        weight: 3,
      },
    ],
  },
  {
    id: "context_management",
    question: "How do you handle context when working with AI tools?",
    options: [
      {
        value: "minimal",
        label: "I give minimal context in prompts",
        weight: 0,
      },
      { value: "basic", label: "I provide basic project context", weight: 1 },
      {
        value: "structured",
        label: "I systematically manage context and codebase information",
        weight: 2,
      },
      {
        value: "engineered",
        label: "I engineer context pipelines and maintain AI knowledge bases",
        weight: 3,
      },
    ],
  },
  {
    id: "quality_control",
    question: "How do you ensure quality of AI-generated code?",
    options: [
      {
        value: "minimal",
        label: "I mostly trust AI output without extensive review",
        weight: 0,
      },
      {
        value: "manual",
        label: "I manually review all AI-generated code",
        weight: 1,
      },
      {
        value: "systematic",
        label: "I have structured review processes and quality gates",
        weight: 2,
      },
      {
        value: "automated",
        label: "I use AI-assisted review with automated quality checking",
        weight: 3,
      },
    ],
  },
  {
    id: "tool_integration",
    question: "How do you integrate AI tools into your development workflow?",
    options: [
      {
        value: "ad_hoc",
        label: "I use tools individually as needed",
        weight: 0,
      },
      {
        value: "sequential",
        label: "I use different tools for different phases",
        weight: 1,
      },
      {
        value: "coordinated",
        label: "I coordinate multiple tools within integrated workflows",
        weight: 2,
      },
      {
        value: "orchestrated",
        label: "I orchestrate AI agents with custom automation",
        weight: 3,
      },
    ],
  },
  {
    id: "problem_solving",
    question: "When AI tools can't solve a problem, what do you do?",
    options: [
      {
        value: "stuck",
        label: "I often get stuck and resort to traditional methods",
        weight: 0,
      },
      {
        value: "iterate",
        label: "I try different prompts or switch tools",
        weight: 1,
      },
      {
        value: "strategic",
        label:
          "I systematically break down problems and apply appropriate AI approaches",
        weight: 2,
      },
      {
        value: "innovative",
        label: "I create novel AI workflows and tool combinations",
        weight: 3,
      },
    ],
  },
  {
    id: "team_integration",
    question: "How do you handle AI tools in team environments?",
    options: [
      {
        value: "individual",
        label: "I use AI tools individually without team coordination",
        weight: 0,
      },
      {
        value: "sharing",
        label: "I share AI-generated code with manual team review",
        weight: 1,
      },
      {
        value: "standardized",
        label: "Our team has standardized AI workflows and review processes",
        weight: 2,
      },
      {
        value: "orchestrated",
        label: "I help orchestrate team-wide AI strategies and governance",
        weight: 3,
      },
    ],
  },
];

function calculateMastery(answers: Record<string, string>): MasteryResult {
  const totalScore = Object.values(answers).reduce((sum, answer) => {
    const question = quizQuestions.find((q) =>
      q.options.some((opt) => opt.value === answer),
    );
    const option = question?.options.find((opt) => opt.value === answer);
    return sum + (option?.weight || 0);
  }, 0);

  const maxScore = quizQuestions.length * 3;
  const percentageScore = (totalScore / maxScore) * 100;

  if (percentageScore <= 25) {
    return {
      level: "AI-Curious Developer",
      score: Math.round(percentageScore),
      description:
        "You're in the exploration phase, beginning to discover how AI can enhance your development workflow. This is an exciting starting point with tremendous growth potential.",
      nextSteps: [
        "Start with GitHub Copilot for familiar IDE integration",
        "Experiment with ChatGPT for planning and problem-solving",
        "Practice effective prompt engineering techniques",
        "Join AI development communities and follow learning resources",
      ],
      timeToNext: "2-4 weeks of consistent practice",
    };
  } else if (percentageScore <= 50) {
    return {
      level: "AI-Integrated Developer",
      score: Math.round(percentageScore),
      description:
        "You've successfully integrated AI tools into your workflow and understand their practical benefits. You're building confidence and developing more sophisticated approaches.",
      nextSteps: [
        "Experiment with AI-native IDEs like Cursor",
        "Develop systematic context management strategies",
        "Create personal quality review checklists",
        "Try AI app builders for rapid prototyping",
      ],
      timeToNext: "1-3 months of focused skill building",
    };
  } else if (percentageScore <= 75) {
    return {
      level: "AI-Orchestrating Developer",
      score: Math.round(percentageScore),
      description:
        "You're strategically orchestrating multiple AI systems and have developed sophisticated workflows. You understand the nuances of AI-assisted development and can guide others.",
      nextSteps: [
        "Design multi-tool workflows for complex projects",
        "Implement AI governance processes for teams",
        "Experiment with emerging AI development patterns",
        "Mentor others in AI development best practices",
      ],
      timeToNext: "3-6 months to master advanced techniques",
    };
  } else {
    return {
      level: "AI Development Master",
      score: Math.round(percentageScore),
      description:
        "You're at the forefront of AI-assisted development, creating innovative workflows and setting standards for the industry. Your expertise helps shape the future of software development.",
      nextSteps: [
        "Research and experiment with cutting-edge AI development tools",
        "Contribute to AI development methodologies and best practices",
        "Lead organizational AI transformation initiatives",
        "Share knowledge through content creation and speaking",
      ],
      timeToNext: "Continuous innovation and leadership",
    };
  }
}

export function MasteryQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MasteryResult | null>(null);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const masteryResult = calculateMastery(newAnswers);
      setResult(masteryResult);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  };

  if (result) {
    const getBadgeColor = (level: string) => {
      switch (level) {
        case "AI-Curious Developer":
          return "bg-yellow-100 text-yellow-800 border-yellow-300";
        case "AI-Integrated Developer":
          return "bg-blue-100 text-blue-800 border-blue-300";
        case "AI-Orchestrating Developer":
          return "bg-purple-100 text-purple-800 border-purple-300";
        case "AI Development Master":
          return "bg-green-100 text-green-800 border-green-300";
        default:
          return "bg-gray-100 text-gray-800 border-gray-300";
      }
    };

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <Badge className={`${getBadgeColor(result.level)} mb-3`}>
                {result.level}
              </Badge>
              <div className="mb-2 text-3xl font-bold text-blue-600">
                {result.score}%
              </div>
              <h3 className="mb-4 text-xl font-semibold">
                AI Development Mastery Score
              </h3>
            </div>

            <div className="mb-6 text-center">
              <p className="text-muted-foreground">{result.description}</p>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Next Steps to Level Up:</h4>
              <ul className="space-y-2">
                {result.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-blue-600">→</span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm">
                <strong>Time to next level:</strong> {result.timeToNext}
              </p>
            </div>

            <Button onClick={resetQuiz} variant="outline" className="w-full">
              Retake Assessment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];

  if (!question) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            AI Mastery Assessment
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-secondary transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              className="h-auto w-full justify-start p-4 text-left"
              onClick={() => handleAnswer(question.id, option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
