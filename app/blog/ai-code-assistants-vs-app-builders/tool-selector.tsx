"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectRequirements {
  projectType: string;
  teamSize: string;
  experience: string;
  timeline: string;
  complexity: string;
}

interface ToolRecommendation {
  primary: string;
  secondary: string;
  workflow: string[];
  reasoning: string;
  mastery_level: string;
}

const questions = [
  {
    id: "projectType",
    question: "What type of project are you working on?",
    options: [
      { value: "mvp", label: "MVP / Prototype" },
      { value: "feature", label: "New Feature" },
      { value: "refactor", label: "Legacy Refactoring" },
      { value: "learning", label: "Learning Project" },
      { value: "production", label: "Production Application" },
    ],
  },
  {
    id: "teamSize",
    question: "What's your team size?",
    options: [
      { value: "solo", label: "Solo Developer" },
      { value: "small", label: "Small Team (2-5)" },
      { value: "medium", label: "Medium Team (6-15)" },
      { value: "large", label: "Large Team (15+)" },
    ],
  },
  {
    id: "experience",
    question: "How would you describe your AI tool experience?",
    options: [
      { value: "beginner", label: "Just getting started" },
      { value: "intermediate", label: "Some experience with AI tools" },
      { value: "advanced", label: "Comfortable with multiple AI tools" },
      { value: "expert", label: "Power user, orchestrating workflows" },
    ],
  },
  {
    id: "timeline",
    question: "What's your project timeline?",
    options: [
      { value: "days", label: "Days" },
      { value: "weeks", label: "Weeks" },
      { value: "months", label: "Months" },
      { value: "ongoing", label: "Ongoing Development" },
    ],
  },
  {
    id: "complexity",
    question: "How complex is the technical implementation?",
    options: [
      { value: "simple", label: "Simple CRUD / Standard patterns" },
      { value: "moderate", label: "Some custom business logic" },
      { value: "complex", label: "Complex algorithms / Architecture" },
      { value: "enterprise", label: "Enterprise-scale complexity" },
    ],
  },
];

function getRecommendation(requirements: ProjectRequirements): ToolRecommendation {
  const { projectType, teamSize, experience, timeline, complexity } = requirements;

  // AI-Curious Developer (Beginner)
  if (experience === "beginner") {
    if (projectType === "mvp" || timeline === "days") {
      return {
        primary: "V0 + GitHub Copilot",
        secondary: "ChatGPT for planning",
        workflow: [
          "Use ChatGPT to plan features and structure",
          "Generate UI components with V0",
          "Use Copilot for implementation details",
          "Manual testing and review",
        ],
        reasoning: "Start with visual tools and familiar IDE integration to build confidence.",
        mastery_level: "AI-Curious Developer",
      };
    }
    return {
      primary: "GitHub Copilot + ChatGPT",
      secondary: "Claude for code review",
      workflow: [
        "Plan with ChatGPT conversations",
        "Code with Copilot suggestions",
        "Review code with Claude",
        "Iterate based on feedback",
      ],
      reasoning: "Build foundational skills with mainstream tools before exploring specialized options.",
      mastery_level: "AI-Curious Developer",
    };
  }

  // AI-Integrated Developer (Intermediate)
  if (experience === "intermediate") {
    if (projectType === "mvp" && teamSize === "solo") {
      return {
        primary: "Lovable → Cursor",
        secondary: "Claude Code for optimization",
        workflow: [
          "Generate full-stack app with Lovable",
          "Export and enhance with Cursor",
          "Optimize with Claude Code",
          "Deploy with AI-generated scripts",
        ],
        reasoning: "Leverage end-to-end generation then refine with AI-native editing for rapid solo development.",
        mastery_level: "AI-Integrated Developer",
      };
    }
    if (complexity === "complex" || projectType === "refactor") {
      return {
        primary: "Cursor + Claude Code",
        secondary: "GitHub Copilot for routine tasks",
        workflow: [
          "Analyze codebase with Claude Code",
          "Implement changes with Cursor",
          "Generate tests with Copilot",
          "Review and iterate continuously",
        ],
        reasoning: "Combine conversational planning with AI-native development for complex challenges.",
        mastery_level: "AI-Integrated Developer",
      };
    }
    return {
      primary: "V0 + Cursor",
      secondary: "Claude Code for architecture",
      workflow: [
        "Design components with V0",
        "Integrate with Cursor",
        "Architectural guidance from Claude Code",
        "Team code reviews with AI assistance",
      ],
      reasoning: "Balanced approach combining visual generation, AI-native development, and strategic planning.",
      mastery_level: "AI-Integrated Developer",
    };
  }

  // AI-Orchestrating Developer (Advanced/Expert)
  if (experience === "advanced" || experience === "expert") {
    if (teamSize === "large" || complexity === "enterprise") {
      return {
        primary: "Claude Code + Custom AI Workflows",
        secondary: "Cursor + Copilot for team",
        workflow: [
          "Design system architecture with Claude Code",
          "Create AI workflow templates",
          "Coordinate team tools (Cursor/Copilot)",
          "Implement quality gates and review processes",
          "Continuous optimization and tool evaluation",
        ],
        reasoning: "Orchestrate multiple AI systems while maintaining enterprise-grade quality and team coordination.",
        mastery_level: "AI-Orchestrating Developer",
      };
    }
    return {
      primary: "Multi-tool Orchestration",
      secondary: "Context-aware AI agents",
      workflow: [
        "Strategic planning with Claude Code",
        "Rapid prototyping with AI app builders",
        "Development with AI-native IDEs",
        "Quality assurance with AI review systems",
        "Performance optimization with specialized AI tools",
      ],
      reasoning: "Master-level approach using the optimal tool for each development phase.",
      mastery_level: "AI-Orchestrating Developer",
    };
  }

  // Default fallback
  return {
    primary: "GitHub Copilot + ChatGPT",
    secondary: "V0 for UI components",
    workflow: [
      "Start with familiar tools",
      "Gradually expand AI integration",
      "Focus on building confidence",
      "Iterate and improve workflows",
    ],
    reasoning: "Safe starting point for building AI development skills.",
    mastery_level: "AI-Curious Developer",
  };
}

export function ToolSelector() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [requirements, setRequirements] = useState<Partial<ProjectRequirements>>({});
  const [recommendation, setRecommendation] = useState<ToolRecommendation | null>(null);

  const handleAnswer = (questionId: string, value: string) => {
    const newRequirements = { ...requirements, [questionId]: value };
    setRequirements(newRequirements);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Generate recommendation
      const rec = getRecommendation(newRequirements as ProjectRequirements);
      setRecommendation(rec);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setRequirements({});
    setRecommendation(null);
  };

  if (recommendation) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Your AI Development Recommendation</h3>
              <Badge variant="outline">{recommendation.mastery_level}</Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">PRIMARY TOOLS</h4>
                <p className="font-semibold">{recommendation.primary}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">SECONDARY</h4>
                <p className="text-sm">{recommendation.secondary}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">REASONING</h4>
              <p className="text-sm">{recommendation.reasoning}</p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">RECOMMENDED WORKFLOW</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {recommendation.workflow.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <Button onClick={resetQuiz} variant="outline" className="w-full">
              Try Different Requirements
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  if (!question) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              className="w-full justify-start text-left h-auto p-4"
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