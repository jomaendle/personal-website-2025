"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/lib/useAnalytics";

interface DayTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  type: 'setup' | 'practice' | 'learn' | 'build' | 'share' | 'measure';
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  masteryLevel: 'curious' | 'integrated' | 'orchestrating' | 'all';
}

interface Week {
  id: number;
  title: string;
  focus: string;
  objectives: string[];
  expectedOutcome: string;
  days: DayTask[];
}

const roadmapData: Week[] = [
  {
    id: 1,
    title: "Foundation & Assessment",
    focus: "Build your AI development baseline and master fundamentals",
    objectives: [
      "Complete comprehensive AI mastery assessment",
      "Establish systematic AI tool integration",
      "Master context engineering fundamentals",
      "Implement quality review processes"
    ],
    expectedOutcome: "20-30% improvement in development speed for routine tasks",
    days: [
      {
        id: "1-1",
        title: "Complete AI Mastery Assessment & Planning",
        description: "Take the comprehensive assessment from Article 1, document current workflow, and establish baseline measurements for key development tasks",
        completed: false,
        type: "setup",
        estimatedTime: "30 min",
        difficulty: "easy",
        masteryLevel: "all"
      },
      {
        id: "1-2", 
        title: "AI Tool Stack Setup & Configuration",
        description: "Install and configure your recommended AI tools from Article 2. Set up accounts, IDE integrations, and initial preferences",
        completed: false,
        type: "setup",
        estimatedTime: "45 min",
        difficulty: "easy",
        masteryLevel: "all"
      },
      {
        id: "1-3",
        title: "Context Engineering Fundamentals",
        description: "Learn and practice Project Context Blocks. Create your first AI-readable project documentation and practice structured prompting",
        completed: false,
        type: "practice",
        estimatedTime: "60 min",
        difficulty: "medium",
        masteryLevel: "curious"
      },
      {
        id: "1-4",
        title: "Implement 3-Layer Review Process",
        description: "Practice systematic AI suggestion review: Syntax Check → Logic Validation → Integration Assessment on all AI outputs today",
        completed: false,
        type: "practice",
        estimatedTime: "45 min",
        difficulty: "medium",
        masteryLevel: "curious"
      },
      {
        id: "1-5",
        title: "Multi-Tool Workflow Practice", 
        description: "Experiment with your recommended tool combination. Practice moving context between tools and coordinating AI assistance across platforms",
        completed: false,
        type: "practice",
        estimatedTime: "60 min",
        difficulty: "medium",
        masteryLevel: "integrated"
      },
      {
        id: "1-6",
        title: "AI Collaboration Success Documentation",
        description: "Document one significant 'context engineering' breakthrough moment. Analyze what made it successful and create reusable patterns",
        completed: false,
        type: "learn",
        estimatedTime: "30 min",
        difficulty: "easy",
        masteryLevel: "all"
      },
      {
        id: "1-7",
        title: "Week 1 Assessment & Baseline Measurement",
        description: "Track AI suggestion acceptance rate, rejection reasons, and time savings. Document baseline measurements for productivity comparison",
        completed: false,
        type: "measure",
        estimatedTime: "45 min",
        difficulty: "medium",
        masteryLevel: "all"
      }
    ]
  },
  {
    id: 2,
    title: "Skill Development",
    focus: "Develop systematic AI collaboration patterns and workflow optimization",
    objectives: [
      "Master advanced prompting and iteration techniques",
      "Optimize AI tool integration for your workflow",
      "Develop AI-assisted architectural thinking",
      "Build systematic quality assurance approaches"
    ],
    expectedOutcome: "40-60% improvement in feature development velocity",
    days: [
      {
        id: "2-1",
        title: "Repetitive Task AI Optimization",
        description: "Identify 5 repetitive coding tasks and develop AI-assisted workflows for each. Create templates and shortcuts for maximum efficiency",
        completed: false,
        type: "practice",
        estimatedTime: "60 min",
        difficulty: "medium",
        masteryLevel: "curious"
      },
      {
        id: "2-2",
        title: "Advanced Prompt Engineering Mastery",
        description: "Practice systematic prompt refinement: start basic, iterate until optimal. Document successful prompting patterns for reuse",
        completed: false,
        type: "practice",
        estimatedTime: "45 min",
        difficulty: "medium",
        masteryLevel: "all"
      },
      {
        id: "2-3",
        title: "AI-Assisted Architectural Planning",
        description: "Use conversational AI (ChatGPT/Claude) for one significant architectural planning session. Focus on system design and technical decision-making",
        completed: false,
        type: "learn",
        estimatedTime: "75 min",
        difficulty: "hard",
        masteryLevel: "integrated"
      },
      {
        id: "2-4",
        title: "Advanced Tool Integration Experiments",
        description: "Level-specific: L1: Master Copilot+AI combo | L2: Experiment with Cursor workflows | L3: Design custom multi-agent workflows",
        completed: false,
        type: "practice",
        estimatedTime: "90 min",
        difficulty: "hard",
        masteryLevel: "all"
      },
      {
        id: "2-5",
        title: "Quality Automation Development",
        description: "Develop systematic approaches to AI-assisted code review, testing, and quality assurance. Create personal quality checklists",
        completed: false,
        type: "build",
        estimatedTime: "60 min",
        difficulty: "medium",
        masteryLevel: "integrated"
      },
      {
        id: "2-6",
        title: "AI-Assisted Testing & Documentation",
        description: "Practice using AI for comprehensive test generation, documentation creation, and code explanation. Build systematic approaches",
        completed: false,
        type: "build",
        estimatedTime: "75 min",
        difficulty: "medium",
        masteryLevel: "all"
      },
      {
        id: "2-7",
        title: "Personal AI Development Templates",
        description: "Create reusable templates for common AI-assisted development tasks: project setup, feature development, code review, debugging",
        completed: false,
        type: "build",
        estimatedTime: "60 min",
        difficulty: "medium",
        masteryLevel: "all"
      }
    ]
  },
  {
    id: 3,
    title: "Advanced Integration",
    focus: "Orchestrate multiple AI systems and tackle complex challenges",
    objectives: [
      "Master multi-tool orchestration for complex projects",
      "Build advanced context management systems",
      "Lead AI integration in team environments",
      "Tackle significant architectural challenges with AI"
    ],
    expectedOutcome: "70-100% improvement in complex problem-solving speed",
    days: [
      {
        id: "3-1",
        title: "Complex Multi-Tool Orchestration",
        description: "Level-specific: L1: Add V0 to workflow | L2: Master context pipelines | L3: Design custom multi-agent automation systems",
        completed: false,
        type: "build",
        estimatedTime: "90 min",
        difficulty: "hard",
        masteryLevel: "all"
      },
      {
        id: "3-2",
        title: "Advanced Context Pipeline Management",
        description: "Build systems that maintain AI knowledge across tool switches. Create context transfer protocols and automated context injection",
        completed: false,
        type: "build",
        estimatedTime: "75 min",
        difficulty: "hard",
        masteryLevel: "integrated"
      },
      {
        id: "3-3",
        title: "AI-Assisted Complex Problem Solving",
        description: "Use AI for a significant architectural decision or complex refactoring project. Document approach and measure effectiveness",
        completed: false,
        type: "build",
        estimatedTime: "120 min",
        difficulty: "hard",
        masteryLevel: "integrated"
      },
      {
        id: "3-4",
        title: "Team AI Integration & Standards",
        description: "Solo: Develop personal standards | Small Team: Propose AI integration standards | Large Team: Design governance frameworks",
        completed: false,
        type: "build",
        estimatedTime: "60 min",
        difficulty: "medium",
        masteryLevel: "orchestrating"
      },
      {
        id: "3-5",
        title: "AI-Assisted Project Documentation",
        description: "Create comprehensive documentation of successful AI-assisted project outcomes. Include methodology, tools, and measured results",
        completed: false,
        type: "learn",
        estimatedTime: "45 min",
        difficulty: "medium",
        masteryLevel: "all"
      },
      {
        id: "3-6",
        title: "Advanced Iterative Development Cycles",
        description: "Experiment with AI-enhanced iterative development cycles. Focus on rapid prototyping, testing, and refinement workflows",
        completed: false,
        type: "practice",
        estimatedTime: "90 min",
        difficulty: "hard",
        masteryLevel: "integrated"
      },
      {
        id: "3-7",
        title: "Week 3 Milestone Project Completion",
        description: "Complete one substantial project component using advanced AI assistance. Document approach, challenges, and breakthrough moments",
        completed: false,
        type: "build",
        estimatedTime: "120 min",
        difficulty: "hard",
        masteryLevel: "all"
      }
    ]
  },
  {
    id: 4,
    title: "Mastery & Optimization",
    focus: "Refine approaches, measure improvements, and plan continued advancement",
    objectives: [
      "Quantify productivity and quality improvements",
      "Optimize personal AI development methodology",
      "Share knowledge and mentor others",
      "Plan advancement to next mastery level"
    ],
    expectedOutcome: "Sustainable AI workflows with documented transformation case study",
    days: [
      {
        id: "4-1",
        title: "Comprehensive Productivity Analysis",
        description: "Analyze AI-assisted productivity improvements over 3 weeks. Compare baseline measurements with current performance across key metrics",
        completed: false,
        type: "measure",
        estimatedTime: "60 min",
        difficulty: "medium",
        masteryLevel: "all"
      },
      {
        id: "4-2",
        title: "AI Workflow Pattern Optimization",
        description: "Identify and eliminate inefficient AI interaction patterns. Optimize successful approaches and create refined workflow documentation",
        completed: false,
        type: "learn",
        estimatedTime: "75 min",
        difficulty: "medium",
        masteryLevel: "all"
      },
      {
        id: "4-3",
        title: "Personal AI Stack Optimization",
        description: "Optimize personal AI development stack based on 3 weeks of actual results. Adjust tool selection and integration approaches",
        completed: false,
        type: "build",
        estimatedTime: "90 min",
        difficulty: "medium",
        masteryLevel: "all"
      },
      {
        id: "4-4",
        title: "Knowledge Sharing & Mentoring",
        description: "Document comprehensive learnings | Team environments: Conduct AI development knowledge sharing session or mentoring",
        completed: false,
        type: "share",
        estimatedTime: "60 min",
        difficulty: "medium",
        masteryLevel: "all"
      },
      {
        id: "4-5",
        title: "Community Contribution Initiative",
        description: "Begin contributing to AI development communities: write about learnings, help others, or share successful patterns and templates",
        completed: false,
        type: "share",
        estimatedTime: "45 min",
        difficulty: "easy",
        masteryLevel: "integrated"
      },
      {
        id: "4-6",
        title: "Cutting-Edge AI Development Experimentation",
        description: "Experiment with cutting-edge AI development techniques, tools, or methodologies. Focus on future-proofing and innovation",
        completed: false,
        type: "practice",
        estimatedTime: "90 min",
        difficulty: "hard",
        masteryLevel: "orchestrating"
      },
      {
        id: "4-7",
        title: "Future Planning & Advanced Goal Setting",
        description: "Plan progression to next mastery level, set advancement goals, and create 60-90 day AI development roadmap for continued growth",
        completed: false,
        type: "learn",
        estimatedTime: "45 min",
        difficulty: "medium",
        masteryLevel: "all"
      }
    ]
  }
];

export function RoadmapTimeline() {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [masteryFilter, setMasteryFilter] = useState<string>('all');
  const { trackEvent } = useAnalytics();

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    const wasCompleted = newCompleted.has(taskId);
    const task = roadmapData.flatMap(w => w.days).find(d => d.id === taskId);
    
    if (wasCompleted) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
      
      // Track task completion
      if (task) {
        trackEvent('roadmap_day_clicked', {
          article: 'transformation_guide',
          day: parseInt(taskId.split('-')[1] || '0') || 0,
          week: parseInt(taskId.split('-')[0] || '0') || 0,
          activity_type: task.type
        });
        
        // Check if this completes a week
        const weekId = parseInt(taskId.split('-')[0] || '0');
        const week = roadmapData.find(w => w.id === weekId);
        if (week) {
          const weekTasks = week.days.filter(day => 
            masteryFilter === 'all' || day.masteryLevel === masteryFilter || day.masteryLevel === 'all'
          );
          const weekCompletedAfter = weekTasks.filter(day => 
            newCompleted.has(day.id)
          ).length;
          
          if (weekCompletedAfter === weekTasks.length) {
            trackEvent('roadmap_milestone_viewed', {
              article: 'transformation_guide',
              milestone: `Week ${weekId} Complete`,
              week: weekId
            });
          }
        }
      }
    }
    
    setCompletedTasks(newCompleted);
  };

  const getWeekProgress = (week: Week) => {
    const relevantTasks = week.days.filter(day => 
      masteryFilter === 'all' || day.masteryLevel === masteryFilter || day.masteryLevel === 'all'
    );
    const completed = relevantTasks.filter(day => completedTasks.has(day.id)).length;
    return relevantTasks.length > 0 ? Math.round((completed / relevantTasks.length) * 100) : 0;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'setup': return 'bg-secondary text-foreground border-border';
      case 'practice': return 'bg-muted/50 text-foreground border-border';
      case 'learn': return 'bg-secondary/70 text-foreground border-border';
      case 'build': return 'bg-muted/30 text-foreground border-border';
      case 'share': return 'bg-secondary/40 text-foreground border-border';
      case 'measure': return 'bg-muted/60 text-foreground border-border';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-muted-foreground';
      case 'medium': return 'text-foreground';
      case 'hard': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'curious': return 'bg-muted/20 border-border';
      case 'integrated': return 'bg-secondary/30 border-border';
      case 'orchestrating': return 'bg-muted/30 border-border';
      default: return 'bg-card border-border';
    }
  };

  const selectedWeekData = roadmapData.find(w => w.id === selectedWeek);
  const allTasks = roadmapData.flatMap(week => week.days);
  const relevantTasks = allTasks.filter(task => 
    masteryFilter === 'all' || task.masteryLevel === masteryFilter || task.masteryLevel === 'all'
  );
  const totalCompleted = relevantTasks.filter(task => completedTasks.has(task.id)).length;
  const overallProgress = relevantTasks.length > 0 ? Math.round((totalCompleted / relevantTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Mastery Level Filter */}
      <div className="bg-secondary/30 rounded-lg p-4 border border-border">
        <h3 className="font-semibold mb-3">🎯 Customize for Your Level</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={masteryFilter === 'all' ? 'default' : 'outline'}
            onClick={() => {
              setMasteryFilter('all');
              trackEvent('roadmap_week_expanded', {
                article: 'transformation_guide',
                week: 0 as 1 | 2 | 3 | 4,
                week_title: 'All Levels Filter'
              });
            }}
          >
            All Levels
          </Button>
          <Button
            size="sm"
            variant={masteryFilter === 'curious' ? 'default' : 'outline'}
            onClick={() => {
              setMasteryFilter('curious');
              trackEvent('roadmap_week_expanded', {
                article: 'transformation_guide',
                week: 0 as 1 | 2 | 3 | 4,
                week_title: 'AI-Curious Filter'
              });
            }}
            className="bg-secondary text-foreground hover:bg-secondary/80"
          >
            AI-Curious
          </Button>
          <Button
            size="sm"
            variant={masteryFilter === 'integrated' ? 'default' : 'outline'}
            onClick={() => {
              setMasteryFilter('integrated');
              trackEvent('roadmap_week_expanded', {
                article: 'transformation_guide',
                week: 0 as 1 | 2 | 3 | 4,
                week_title: 'AI-Integrated Filter'
              });
            }}
            className="bg-muted text-foreground hover:bg-muted/80"
          >
            AI-Integrated
          </Button>
          <Button
            size="sm"
            variant={masteryFilter === 'orchestrating' ? 'default' : 'outline'}
            onClick={() => {
              setMasteryFilter('orchestrating');
              trackEvent('roadmap_week_expanded', {
                article: 'transformation_guide',
                week: 0 as 1 | 2 | 3 | 4,
                week_title: 'AI-Orchestrating Filter'
              });
            }}
            className="bg-secondary/70 text-foreground hover:bg-secondary"
          >
            AI-Orchestrating
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-muted/20 rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Your 30-Day AI Development Transformation</h3>
            <p className="text-muted-foreground">Track your systematic advancement through proven practice frameworks</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-link">{overallProgress}%</div>
            <div className="text-sm text-muted-foreground">{totalCompleted}/{relevantTasks.length} tasks completed</div>
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div 
            className="bg-link h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Week Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roadmapData.map((week) => {
          const progress = getWeekProgress(week);
          return (
            <Button
              key={week.id}
              variant={selectedWeek === week.id ? "default" : "outline"}
              className={`h-auto p-4 flex flex-col items-start space-y-2 ${
                selectedWeek === week.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setSelectedWeek(week.id);
                trackEvent('roadmap_week_expanded', {
                  article: 'transformation_guide',
                  week: week.id as 1 | 2 | 3 | 4,
                  week_title: week.title
                });
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold">Week {week.id}</span>
                <span className="text-xs">{progress}%</span>
              </div>
              <div className="text-xs text-left opacity-80">{week.title}</div>
              <div className="w-full bg-secondary rounded-full h-1">
                <div 
                  className="bg-current h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </Button>
          );
        })}
      </div>

      {/* Selected Week Details */}
      {selectedWeekData && (
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              Week {selectedWeekData.id}: {selectedWeekData.title}
            </h3>
            <p className="text-muted-foreground mb-4">{selectedWeekData.focus}</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-medium mb-2">🎯 Week Objectives</h4>
                <ul className="text-sm space-y-1">
                  {selectedWeekData.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-link">•</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">📊 Expected Outcome</h4>
                <p className="text-sm bg-muted/20 p-3 rounded-lg border border-border">
                  {selectedWeekData.expectedOutcome}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Progress: {getWeekProgress(selectedWeekData)}% 
                ({selectedWeekData.days.filter(day => 
                  (masteryFilter === 'all' || day.masteryLevel === masteryFilter || day.masteryLevel === 'all') && 
                  completedTasks.has(day.id)
                ).length}/{selectedWeekData.days.filter(day => 
                  masteryFilter === 'all' || day.masteryLevel === masteryFilter || day.masteryLevel === 'all'
                ).length} completed)
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {selectedWeekData.days
              .filter(day => masteryFilter === 'all' || day.masteryLevel === masteryFilter || day.masteryLevel === 'all')
              .map((day, index) => (
              <div 
                key={day.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  completedTasks.has(day.id) 
                    ? 'bg-muted/30 border-muted' 
                    : `${getMasteryColor(day.masteryLevel)} hover:border-muted-foreground/30`
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(day.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      completedTasks.has(day.id)
                        ? 'bg-link border-link'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    {completedTasks.has(day.id) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(day.type)}`}>
                        {day.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">Day {index + 1}</span>
                      <span className={`text-xs font-medium ${getDifficultyColor(day.difficulty)}`}>
                        {day.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {day.estimatedTime}
                      </span>
                      {day.masteryLevel !== 'all' && (
                        <Badge variant="outline" className="text-xs">
                          {day.masteryLevel}
                        </Badge>
                      )}
                    </div>
                    <h4 className={`font-medium mb-1 ${completedTasks.has(day.id) ? 'line-through text-muted-foreground' : ''}`}>
                      {day.title}
                    </h4>
                    <p className={`text-sm ${completedTasks.has(day.id) ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                      {day.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {['setup', 'practice', 'learn', 'build', 'share', 'measure'].map((type) => {
          const typeTasks = relevantTasks.filter(task => task.type === type);
          const completed = typeTasks.filter(task => completedTasks.has(task.id)).length;
          
          return (
            <div key={type} className={`p-3 rounded-lg border ${getTypeColor(type)}`}>
              <div className="text-xs font-medium opacity-75">{type.toUpperCase()}</div>
              <div className="text-lg font-bold">{completed}/{typeTasks.length}</div>
              <div className="text-xs opacity-75">
                {typeTasks.length > 0 ? Math.round((completed / typeTasks.length) * 100) : 0}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Celebration */}
      {overallProgress === 100 && (
        <div className="bg-primary/10 border border-primary/20 text-foreground p-6 rounded-lg text-center">
          <h3 className="text-xl font-bold mb-2">🎉 Congratulations!</h3>
          <p className="mb-4">You&apos;ve completed your 30-day AI development transformation!</p>
          <p className="text-sm opacity-90">
            Continue to Article 4 for advanced AI orchestration patterns and team leadership frameworks.
          </p>
        </div>
      )}
    </div>
  );
}