"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAnalytics } from "@/lib/useAnalytics";

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
  costEstimate: string;
  advancedTips: string[];
  nextSteps: {
    immediate: string[];
    advanced: string[];
  };
}

const questions = [
  {
    id: "projectType",
    question: "What type of project are you working on?",
    options: [
      { value: "mvp", label: "MVP / Prototype - Need to validate ideas quickly" },
      { value: "feature", label: "New Feature - Adding to existing codebase" },
      { value: "refactor", label: "Legacy Refactoring - Modernizing existing code" },
      { value: "learning", label: "Learning Project - Skill development focus" },
      { value: "production", label: "Production Application - Enterprise-grade development" },
    ],
  },
  {
    id: "teamSize",
    question: "What's your team size and collaboration needs?",
    options: [
      { value: "solo", label: "Solo Developer - Maximum individual productivity" },
      { value: "small", label: "Small Team (2-5) - Coordination without overhead" },
      { value: "medium", label: "Medium Team (6-15) - Standardization important" },
      { value: "large", label: "Large Team (15+) - Governance and compliance required" },
    ],
  },
  {
    id: "experience",
    question: "How would you describe your AI tool experience?",
    options: [
      { value: "beginner", label: "Just getting started - Need familiar, low-risk tools" },
      { value: "intermediate", label: "Some experience - Ready for AI-native workflows" },
      { value: "advanced", label: "Comfortable with multiple AI tools - Want optimization" },
      { value: "expert", label: "Power user - Ready for custom orchestration" },
    ],
  },
  {
    id: "timeline",
    question: "What's your project timeline and urgency?",
    options: [
      { value: "days", label: "Days - Need immediate results" },
      { value: "weeks", label: "Weeks - Balanced approach" },
      { value: "months", label: "Months - Can invest in learning curve" },
      { value: "ongoing", label: "Ongoing Development - Long-term optimization" },
    ],
  },
  {
    id: "complexity",
    question: "How complex is the technical implementation?",
    options: [
      { value: "simple", label: "Simple CRUD / Standard patterns - Well-understood domain" },
      { value: "moderate", label: "Some custom business logic - Moderate complexity" },
      { value: "complex", label: "Complex algorithms / Architecture - High technical challenge" },
      { value: "enterprise", label: "Enterprise-scale complexity - Multiple system integration" },
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
          "Plan features and structure with ChatGPT conversations",
          "Generate UI components quickly with V0's visual interface",
          "Use GitHub Copilot for implementation details and code completion",
          "Manual testing and review to build quality assessment skills",
          "Iterate based on feedback and learning outcomes"
        ],
        reasoning: "Start with visual tools and familiar IDE integration to build confidence while delivering results quickly. This combination minimizes learning curve while providing immediate value.",
        mastery_level: "AI-Curious Developer",
        costEstimate: "$20-30/month (Copilot + ChatGPT Plus)",
        advancedTips: [
          "Practice effective prompting with ChatGPT before moving to specialized tools",
          "Document successful V0 component patterns for reuse",
          "Build systematic code review habits with Copilot suggestions"
        ],
        nextSteps: {
          immediate: [
            "Set up GitHub Copilot in your preferred IDE",
            "Create structured prompt templates for common tasks",
            "Practice the 3-Layer Review Process on all AI suggestions"
          ],
          advanced: [
            "Experiment with Claude for more complex planning conversations",
            "Try Cursor for AI-native development environment",
            "Explore context engineering techniques for better AI collaboration"
          ]
        }
      };
    }
    return {
      primary: "GitHub Copilot + ChatGPT",
      secondary: "Claude for code review",
      workflow: [
        "Plan features and architecture with ChatGPT conversations",
        "Implement with GitHub Copilot providing inline suggestions",
        "Review and improve code quality with Claude's analysis",
        "Iterate based on feedback and develop quality standards",
        "Document learnings and successful patterns"
      ],
      reasoning: "Build foundational skills with mainstream tools before exploring specialized options. This stack provides familiar integration with systematic quality improvement.",
      mastery_level: "AI-Curious Developer",
      costEstimate: "$30-40/month (Copilot + ChatGPT + Claude)",
      advancedTips: [
        "Use ChatGPT for learning new frameworks and concepts",
        "Develop personal code review checklists with Claude",
        "Practice explaining your code to AI for better understanding"
      ],
      nextSteps: {
        immediate: [
          "Establish daily AI interaction routines",
          "Create project context templates",
          "Practice prompt engineering fundamentals"
        ],
        advanced: [
          "Experiment with more sophisticated AI tools",
          "Develop multi-tool workflows",
          "Learn advanced context management techniques"
        ]
      }
    };
  }

  // AI-Integrated Developer (Intermediate)
  if (experience === "intermediate") {
    if (projectType === "mvp" && teamSize === "solo") {
      return {
        primary: "Lovable → Cursor",
        secondary: "Claude Code for optimization",
        workflow: [
          "Generate full-stack application foundation with Lovable",
          "Export and enhance codebase with Cursor's AI-native editing",
          "Optimize architecture and implementation with Claude Code",
          "Deploy with AI-generated scripts and configuration",
          "Iterate rapidly based on user feedback"
        ],
        reasoning: "Leverage end-to-end generation then refine with AI-native editing for rapid solo development. This approach maximizes speed while maintaining code quality.",
        mastery_level: "AI-Integrated Developer",
        costEstimate: "$50-80/month (Lovable + Cursor + Claude)",
        advancedTips: [
          "Use Lovable's iteration features for rapid UI experimentation",
          "Develop Cursor workflows for complex refactoring tasks",
          "Build Claude Code templates for architectural review"
        ],
        nextSteps: {
          immediate: [
            "Master Lovable's prompt engineering for accurate generation",
            "Learn Cursor's codebase conversation features",
            "Develop systematic deployment automation"
          ],
          advanced: [
            "Experiment with custom AI agent workflows",
            "Design reusable component libraries",
            "Explore advanced orchestration patterns"
          ]
        }
      };
    }
    if (complexity === "complex" || projectType === "refactor") {
      return {
        primary: "Cursor + Claude Code",
        secondary: "GitHub Copilot for routine tasks",
        workflow: [
          "Analyze existing codebase architecture with Claude Code",
          "Plan refactoring strategy with comprehensive context analysis",
          "Implement changes with Cursor's AI-native development environment",
          "Generate comprehensive tests with GitHub Copilot",
          "Review and iterate with continuous AI-assisted analysis"
        ],
        reasoning: "Combine conversational planning with AI-native development for complex challenges. This approach provides deep codebase understanding with powerful implementation capabilities.",
        mastery_level: "AI-Integrated Developer",
        costEstimate: "$40-60/month (Cursor + Claude + Copilot)",
        advancedTips: [
          "Use Claude Code for complex architectural decisions",
          "Master Cursor's multi-file editing capabilities",
          "Develop systematic approaches to legacy code analysis"
        ],
        nextSteps: {
          immediate: [
            "Set up comprehensive codebase analysis workflows",
            "Develop quality gates for complex refactoring",
            "Create systematic testing strategies with AI assistance"
          ],
          advanced: [
            "Design custom refactoring automation",
            "Explore advanced code analysis patterns",
            "Build team knowledge sharing systems"
          ]
        }
      };
    }
    return {
      primary: "V0 + Cursor",
      secondary: "Claude Code for architecture",
      workflow: [
        "Design component architecture with V0's visual interface",
        "Integrate and develop with Cursor's AI-native environment",
        "Get architectural guidance from Claude Code for complex decisions",
        "Conduct team code reviews with AI assistance and collaboration",
        "Maintain quality standards through systematic AI-assisted processes"
      ],
      reasoning: "Balanced approach combining visual generation, AI-native development, and strategic planning. Optimizes for both individual productivity and team collaboration.",
      mastery_level: "AI-Integrated Developer",
      costEstimate: "$45-65/month (V0 + Cursor + Claude)",
      advancedTips: [
        "Develop component design systems with V0",
        "Use Cursor for complex business logic implementation",
        "Build architectural documentation with Claude Code"
      ],
      nextSteps: {
        immediate: [
          "Establish design-to-development workflows",
          "Create team AI tool standards",
          "Develop quality review processes"
        ],
        advanced: [
          "Design custom development workflows",
          "Explore team orchestration patterns",
          "Build advanced automation systems"
        ]
      }
    };
  }

  // AI-Orchestrating Developer (Advanced/Expert)
  if (experience === "advanced" || experience === "expert") {
    if (teamSize === "large" || complexity === "enterprise") {
      return {
        primary: "Claude Code + Custom AI Workflows",
        secondary: "Cursor + Copilot for team",
        workflow: [
          "Design comprehensive system architecture with Claude Code",
          "Create custom AI workflow templates for team standardization",
          "Coordinate team AI tool adoption (Cursor/Copilot) with governance",
          "Implement quality gates and automated review processes",
          "Continuous optimization and tool evaluation with feedback loops"
        ],
        reasoning: "Orchestrate multiple AI systems while maintaining enterprise-grade quality and team coordination. Focus on governance, standardization, and systematic adoption.",
        mastery_level: "AI-Orchestrating Developer",
        costEstimate: "$100-200/month (Enterprise tools + team licenses)",
        advancedTips: [
          "Design AI governance frameworks for quality and compliance",
          "Build custom automation for team workflow coordination",
          "Create comprehensive training programs for team AI adoption"
        ],
        nextSteps: {
          immediate: [
            "Establish enterprise AI development standards",
            "Create team training and onboarding programs",
            "Implement governance and quality assurance systems"
          ],
          advanced: [
            "Research cutting-edge AI development technologies",
            "Design industry-leading development methodologies",
            "Contribute to AI development best practices"
          ]
        }
      };
    }
    return {
      primary: "Multi-tool Orchestration",
      secondary: "Context-aware AI agents",
      workflow: [
        "Strategic planning and architecture with Claude Code",
        "Rapid prototyping with AI app builders (Lovable/V0)",
        "Development with AI-native IDEs (Cursor) and intelligent assistance",
        "Quality assurance with AI review systems and automated testing",
        "Performance optimization with specialized AI tools and analytics"
      ],
      reasoning: "Master-level approach using the optimal tool for each development phase. Maximizes capabilities through sophisticated orchestration and custom workflows.",
      mastery_level: "AI-Orchestrating Developer",
      costEstimate: "$80-150/month (Multiple specialized tools)",
      advancedTips: [
        "Design custom AI agent systems for complex automation",
        "Build advanced context management and knowledge systems",
        "Create innovative workflows that push industry boundaries"
      ],
      nextSteps: {
        immediate: [
          "Experiment with cutting-edge AI development patterns",
          "Design and test custom orchestration workflows",
          "Build advanced automation and intelligence systems"
        ],
        advanced: [
          "Contribute to industry AI development innovation",
          "Design next-generation development methodologies",
          "Lead transformation in AI-assisted software engineering"
        ]
      }
    };
  }

  // Default fallback
  return {
    primary: "GitHub Copilot + ChatGPT",
    secondary: "V0 for UI components",
    workflow: [
      "Start with familiar tools to build confidence",
      "Gradually expand AI integration as comfort grows",
      "Focus on building systematic practices and quality habits",
      "Iterate and improve workflows based on experience",
      "Plan advancement to more sophisticated tool combinations"
    ],
    reasoning: "Safe starting point for building AI development skills. Provides familiar integration with systematic skill development opportunities.",
    mastery_level: "AI-Curious Developer",
    costEstimate: "$25-35/month (Copilot + ChatGPT + V0)",
    advancedTips: [
      "Focus on prompt engineering fundamentals",
      "Build systematic code review practices",
      "Document successful AI collaboration patterns"
    ],
    nextSteps: {
      immediate: [
        "Establish consistent AI tool usage habits",
        "Practice effective prompting techniques",
        "Build quality assessment and review skills"
      ],
      advanced: [
        "Experiment with additional AI tools",
        "Develop more sophisticated workflows",
        "Progress toward AI-integrated mastery level"
      ]
    }
  };
}

export function ToolSelector() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [requirements, setRequirements] = useState<Partial<ProjectRequirements>>({});
  const [recommendation, setRecommendation] = useState<ToolRecommendation | null>(null);
  const [selectorStarted, setSelectorStarted] = useState(false);
  const { trackEvent } = useAnalytics();

  // Track tool selector start on first interaction
  useEffect(() => {
    if (Object.keys(requirements).length === 1 && !selectorStarted) {
      trackEvent('tool_selector_started', { article: 'tool_selection' });
      setSelectorStarted(true);
    }
  }, [requirements, selectorStarted, trackEvent]);

  const handleAnswer = (questionId: string, value: string) => {
    const newRequirements = { ...requirements, [questionId]: value };
    setRequirements(newRequirements);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Generate recommendation
      const rec = getRecommendation(newRequirements as ProjectRequirements);
      setRecommendation(rec);
      
      // Track tool selector completion
      trackEvent('tool_selector_completed', {
        article: 'tool_selection',
        experience_level: newRequirements.experience || 'unknown',
        project_type: newRequirements.projectType || 'unknown',
        team_size: newRequirements.teamSize || 'unknown',
        recommended_stack: rec.primary
      });
      
      // Track tool recommendation generated
      trackEvent('tool_recommendation_generated', {
        article: 'tool_selection',
        primary_tools: rec.primary,
        workflow_type: rec.mastery_level
      });
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setRequirements({});
    setRecommendation(null);
    setSelectorStarted(false);
    
    // Track selector restart
    trackEvent('tool_selector_started', { article: 'tool_selection' });
    setSelectorStarted(true);
  };

  if (recommendation) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Your Personalized AI Development Stack</h3>
              <Badge variant="outline" className="px-3 py-1">
                {recommendation.mastery_level}
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">PRIMARY TOOLS</h4>
                <p className="font-semibold text-lg text-foreground">{recommendation.primary}</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg border border-border">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">SECONDARY TOOLS</h4>
                <p className="font-semibold text-foreground">{recommendation.secondary}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-3">💡 WHY THIS COMBINATION</h4>
                <p className="text-sm mb-4">{recommendation.reasoning}</p>
                
                <h4 className="font-medium text-sm text-muted-foreground mb-3">💰 ESTIMATED COST</h4>
                <p className="text-sm font-medium">{recommendation.costEstimate}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-3">🎯 ADVANCED TIPS</h4>
                <ul className="space-y-1 text-sm">
                  {recommendation.advancedTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-link">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-3">🔄 RECOMMENDED WORKFLOW</h4>
              <ol className="grid md:grid-cols-2 gap-2 text-sm">
                {recommendation.workflow.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-link font-bold">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-lg border border-border">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-3">🚀 IMMEDIATE NEXT STEPS</h4>
                <ul className="space-y-1 text-sm">
                  {recommendation.nextSteps.immediate.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-link">✓</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-3">🔮 ADVANCED PROGRESSION</h4>
                <ul className="space-y-1 text-sm">
                  {recommendation.nextSteps.advanced.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-muted-foreground">→</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={resetQuiz} variant="outline" className="flex-1">
                Try Different Requirements
              </Button>
              <Link 
                href="/blog/ai-development-mastery-series/30-day-transformation-guide" 
                className="flex-1"
                onClick={() => {
                  trackEvent('series_navigation_used', {
                    from_article: 'tool_selection',
                    to_article: 'transformation_guide',
                    navigation_type: 'next_button'
                  });
                }}
              >
                <Button className="w-full">
                  Continue to Implementation Guide →
                </Button>
              </Link>
            </div>
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            AI Tool Selection Matrix
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-link h-2 rounded-full transition-all duration-300"
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
              className="w-full justify-start text-left h-auto p-4 hover:bg-muted/20 hover:border-muted-foreground/30"
              onClick={() => handleAnswer(question.id, option.value)}
            >
              <div>
                <div className="font-medium">{option.label.split(' - ')[0]}</div>
                {option.label.includes(' - ') && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {option.label.split(' - ')[1]}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}