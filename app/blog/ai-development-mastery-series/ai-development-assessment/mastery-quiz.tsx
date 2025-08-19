"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAnalytics } from "@/lib/useAnalytics";

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
  recommendedTools: string[];
  nextArticle: {
    title: string;
    url: string;
    reason: string;
  };
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
        "Master basic context engineering techniques with project context blocks",
        "Implement the 3-Layer Review Process for all AI suggestions",
        "Start with GitHub Copilot for familiar IDE integration",
        "Practice structured prompt engineering with ChatGPT/Claude",
        "Join AI development communities for peer learning"
      ],
      timeToNext: "2-4 weeks of consistent daily practice",
      recommendedTools: ["GitHub Copilot", "ChatGPT", "Claude"],
      nextArticle: {
        title: "Article 2: Tool Selection Matrix",
        url: "/blog/ai-development-mastery-series/ai-tool-selection-matrix",
        reason: "Get beginner-friendly tool recommendations and learn workflow fundamentals."
      }
    };
  } else if (percentageScore <= 50) {
    return {
      level: "AI-Integrated Developer",
      score: Math.round(percentageScore),
      description:
        "You've successfully integrated AI tools into your workflow and understand their practical benefits. You're building confidence and developing more sophisticated approaches.",
      nextSteps: [
        "Experiment with AI-native IDEs like Cursor for codebase-aware development",
        "Develop systematic context management and pipeline strategies",
        "Create comprehensive quality review checklists and automation",
        "Explore AI app builders (V0, Lovable) for rapid prototyping workflows",
        "Design multi-tool orchestration patterns for complex projects"
      ],
      timeToNext: "1-3 months of focused skill building and experimentation",
      recommendedTools: ["Cursor", "Claude Code", "V0", "GitHub Copilot"],
      nextArticle: {
        title: "Article 3: 30-Day Transformation Guide",
        url: "/blog/ai-development-mastery-series/30-day-transformation-guide", 
        reason: "Follow structured advancement roadmap to reach AI-Orchestrating level."
      }
    };
  } else if (percentageScore <= 75) {
    return {
      level: "AI-Orchestrating Developer",
      score: Math.round(percentageScore),
      description:
        "You're strategically orchestrating multiple AI systems and have developed sophisticated workflows. You understand the nuances of AI-assisted development and can guide others.",
      nextSteps: [
        "Design custom multi-agent workflows for complex development challenges",
        "Implement comprehensive AI governance processes for team environments",
        "Experiment with cutting-edge AI development patterns and methodologies",
        "Develop team training and knowledge sharing programs",
        "Contribute to AI development community knowledge and best practices"
      ],
      timeToNext: "3-6 months to master advanced orchestration techniques",
      recommendedTools: ["Claude Code", "Custom AI workflows", "Cursor", "Multi-tool orchestration"],
      nextArticle: {
        title: "Article 4: Advanced AI Workflows",
        url: "/blog/ai-development-mastery-series/advanced-ai-workflows",
        reason: "Master advanced orchestration patterns and team leadership frameworks."
      }
    };
  } else {
    return {
      level: "AI Development Master",
      score: Math.round(percentageScore),
      description:
        "You're at the forefront of AI-assisted development, creating innovative workflows and setting standards for the industry. Your expertise helps shape the future of software development.",
      nextSteps: [
        "Research and experiment with cutting-edge AI development technologies",
        "Design and publish innovative AI development methodologies",
        "Lead organizational AI transformation and governance initiatives",
        "Mentor teams and individuals in advanced AI development practices",
        "Contribute to industry standards and best practices through content and speaking"
      ],
      timeToNext: "Continuous innovation, research, and industry leadership",
      recommendedTools: ["Custom AI systems", "Advanced orchestration platforms", "Emerging AI technologies"],
      nextArticle: {
        title: "Article 4: Advanced AI Workflows", 
        url: "/blog/ai-development-mastery-series/advanced-ai-workflows",
        reason: "Explore cutting-edge patterns and contribute to industry innovation."
      }
    };
  }
}

export function MasteryQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MasteryResult | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const { trackEvent, trackQuizEvent } = useAnalytics();

  // Track quiz start on first interaction
  useEffect(() => {
    if (Object.keys(answers).length === 1 && !quizStarted) {
      trackQuizEvent('started', {});
      setQuizStarted(true);
    }
  }, [answers, quizStarted, trackQuizEvent]);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const masteryResult = calculateMastery(newAnswers);
      setResult(masteryResult);
      
      // Track quiz completion
      const masteryLevel = masteryResult.level.includes('Curious') ? 'ai_curious'
        : masteryResult.level.includes('Integrated') ? 'ai_integrated'
        : masteryResult.level.includes('Orchestrating') ? 'ai_orchestrating'
        : 'ai_curious';
      
      trackQuizEvent('completed', {
        mastery_level: masteryLevel,
        score: masteryResult.score
      });
      
      trackEvent('quiz_level_discovered', {
        article: 'assessment',
        level: masteryLevel
      });
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setQuizStarted(false);
    
    // Track quiz restart
    trackEvent('quiz_started', { article: 'assessment' });
    setQuizStarted(true);
  };

  if (result) {
    const getBadgeColor = (level: string) => {
      switch (level) {
        case "AI-Curious Developer":
          return "bg-secondary text-foreground border-border";
        case "AI-Integrated Developer":
          return "bg-muted/50 text-foreground border-border";
        case "AI-Orchestrating Developer":
          return "bg-secondary/70 text-foreground border-border";
        case "AI Development Master":
          return "bg-primary/10 text-foreground border-primary/20";
        default:
          return "bg-secondary text-muted-foreground border-border";
      }
    };

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <Badge className={`${getBadgeColor(result.level)} mb-4 text-sm px-3 py-1`}>
                {result.level}
              </Badge>
              <div className="mb-3 text-4xl font-bold text-link">
                {result.score}%
              </div>
              <h3 className="mb-4 text-2xl font-semibold">
                AI Development Mastery Score
              </h3>
            </div>

            <div className="mb-6 text-center bg-muted/20 rounded-lg p-4 border border-border">
              <p className="text-muted-foreground">{result.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3 font-semibold text-lg">🎯 Priority Next Steps</h4>
                <ul className="space-y-2">
                  {result.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-link font-bold">{index + 1}.</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-lg">🛠️ Recommended Tools</h4>
                <div className="space-y-2">
                  {result.recommendedTools.map((tool, index) => (
                    <div key={index} className="flex items-center">
                      <span className="mr-2 text-link">✓</span>
                      <span className="text-sm font-medium">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/50 p-6 border border-border">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">⏰ Time to Next Level</h4>
                  <p className="text-sm text-muted-foreground">{result.timeToNext}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📚 Recommended Next Article</h4>
                  <p className="text-sm text-muted-foreground mb-2">{result.nextArticle.reason}</p>
                  <Link 
                    href={result.nextArticle.url}
                    onClick={() => {
                      trackEvent('series_navigation_used', {
                        from_article: 'assessment',
                        to_article: 'tool_selection',
                        navigation_type: 'next_button'
                      });
                    }}
                  >
                    <Button size="sm" className="text-sm">
                      {result.nextArticle.title} →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={resetQuiz} variant="outline" className="flex-1">
                Retake Assessment
              </Button>
              <Link 
                href="/blog/ai-development-mastery-series/ai-tool-selection-matrix" 
                className="flex-1"
                onClick={() => {
                  trackEvent('series_navigation_used', {
                    from_article: 'assessment',
                    to_article: 'tool_selection',
                    navigation_type: 'next_button'
                  });
                }}
              >
                <Button className="w-full">
                  Continue to Tool Selection →
                </Button>
              </Link>
            </div>
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
        <div className="h-2 w-full rounded-full bg-secondary">
          <div
            className="h-2 rounded-full bg-link transition-all duration-300"
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
              className="h-auto w-full justify-start p-4 text-left hover:bg-muted/20 hover:border-muted-foreground/30"
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