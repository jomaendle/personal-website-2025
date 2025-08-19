"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DayTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  type: 'setup' | 'practice' | 'learn' | 'build' | 'share';
}

interface Week {
  id: number;
  title: string;
  focus: string;
  days: DayTask[];
}

const roadmapData: Week[] = [
  {
    id: 1,
    title: "Foundation & Assessment",
    focus: "Build your AI development baseline",
    days: [
      {
        id: "1-1",
        title: "Complete AI Mastery Assessment",
        description: "Take the quiz above to identify your current level and get personalized recommendations",
        completed: false,
        type: "setup"
      },
      {
        id: "1-2", 
        title: "Document Current Workflow",
        description: "Write down your existing development process and pain points",
        completed: false,
        type: "setup"
      },
      {
        id: "1-3",
        title: "Set Up Basic AI Tools",
        description: "Install GitHub Copilot + create ChatGPT/Claude account",
        completed: false,
        type: "setup"
      },
      {
        id: "1-4",
        title: "Context Engineering Practice",
        description: "Practice Project Context Blocks on 3 different coding tasks",
        completed: false,
        type: "practice"
      },
      {
        id: "1-5",
        title: "Quality Review Implementation", 
        description: "Apply 3-Layer Review Process to all AI suggestions today",
        completed: false,
        type: "practice"
      },
      {
        id: "1-6",
        title: "Document Success Story",
        description: "Write down one 'context engineering' breakthrough moment",
        completed: false,
        type: "learn"
      },
      {
        id: "1-7",
        title: "Week 1 Assessment",
        description: "Track AI suggestion acceptance rate and rejection reasons",
        completed: false,
        type: "learn"
      }
    ]
  },
  {
    id: 2,
    title: "Skill Development",
    focus: "Develop systematic AI collaboration patterns",
    days: [
      {
        id: "2-1",
        title: "Pattern Recognition",
        description: "Identify 5 repetitive coding tasks where AI provides significant value",
        completed: false,
        type: "learn"
      },
      {
        id: "2-2",
        title: "Prompt Iteration Practice",
        description: "Practice prompt refinement: start basic, refine until optimal",
        completed: false,
        type: "practice"
      },
      {
        id: "2-3",
        title: "Architectural Planning",
        description: "Use ChatGPT/Claude for one architectural planning conversation",
        completed: false,
        type: "learn"
      },
      {
        id: "2-4",
        title: "Tool Integration Experiment",
        description: "Level 1: Master Copilot+AI combo | Level 2: Try Cursor | Level 3: Design custom workflow",
        completed: false,
        type: "practice"
      },
      {
        id: "2-5",
        title: "Quality Automation",
        description: "Develop systematic approaches to AI-assisted code review",
        completed: false,
        type: "practice"
      },
      {
        id: "2-6",
        title: "AI-Assisted Testing",
        description: "Practice using AI for test generation and documentation",
        completed: false,
        type: "build"
      },
      {
        id: "2-7",
        title: "Template Creation",
        description: "Create templates for common AI-assisted development tasks",
        completed: false,
        type: "build"
      }
    ]
  },
  {
    id: 3,
    title: "Advanced Integration",
    focus: "Orchestrate multiple AI systems effectively",
    days: [
      {
        id: "3-1",
        title: "Multi-Tool Orchestration",
        description: "Level 1: Add V0 | Level 2: Context pipelines | Level 3: Custom multi-agent workflows",
        completed: false,
        type: "build"
      },
      {
        id: "3-2",
        title: "Advanced Context Management",
        description: "Build systems that maintain AI knowledge across tool switches",
        completed: false,
        type: "build"
      },
      {
        id: "3-3",
        title: "Complex Problem Solving",
        description: "Use AI for a significant architectural decision or complex refactoring",
        completed: false,
        type: "build"
      },
      {
        id: "3-4",
        title: "Team Coordination Standards",
        description: "Solo: Personal standards | Team: Propose AI integration standards and quality gates",
        completed: false,
        type: "build"
      },
      {
        id: "3-5",
        title: "Project Documentation",
        description: "Document successful AI-assisted project outcomes",
        completed: false,
        type: "learn"
      },
      {
        id: "3-6",
        title: "Iterative Development",
        description: "Experiment with iterative AI-assisted development cycles",
        completed: false,
        type: "practice"
      },
      {
        id: "3-7",
        title: "Week 3 Milestone",
        description: "Complete one substantial project using AI assistance",
        completed: false,
        type: "build"
      }
    ]
  },
  {
    id: 4,
    title: "Mastery & Optimization",
    focus: "Refine, share knowledge, and plan advancement",
    days: [
      {
        id: "4-1",
        title: "Workflow Analysis",
        description: "Analyze AI-assisted productivity improvements over 3 weeks",
        completed: false,
        type: "learn"
      },
      {
        id: "4-2",
        title: "Pattern Elimination",
        description: "Identify and eliminate inefficient AI interaction patterns",
        completed: false,
        type: "learn"
      },
      {
        id: "4-3",
        title: "Stack Optimization",
        description: "Optimize personal AI development stack based on actual results",
        completed: false,
        type: "build"
      },
      {
        id: "4-4",
        title: "Knowledge Sharing",
        description: "Document learnings | Team: AI development knowledge sharing session",
        completed: false,
        type: "share"
      },
      {
        id: "4-5",
        title: "Community Contribution",
        description: "Begin mentoring others or contributing to AI development communities",
        completed: false,
        type: "share"
      },
      {
        id: "4-6",
        title: "Advanced Experimentation",
        description: "Experiment with cutting-edge AI development techniques",
        completed: false,
        type: "practice"
      },
      {
        id: "4-7",
        title: "Future Planning",
        description: "Plan progression to next mastery level + set advancement goals",
        completed: false,
        type: "learn"
      }
    ]
  }
];

export function RoadmapTimeline() {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const getWeekProgress = (week: Week) => {
    const completed = week.days.filter(day => completedTasks.has(day.id)).length;
    return Math.round((completed / week.days.length) * 100);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'setup': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'practice': return 'bg-green-100 text-green-800 border-green-200';
      case 'learn': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'build': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'share': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectedWeekData = roadmapData.find(w => w.id === selectedWeek);
  const totalTasks = roadmapData.reduce((sum, week) => sum + week.days.length, 0);
  const totalCompleted = completedTasks.size;
  const overallProgress = Math.round((totalCompleted / totalTasks) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Your AI Development Journey</h3>
            <p className="text-muted-foreground">Track your progress through the 30-day transformation</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
            <div className="text-sm text-muted-foreground">{totalCompleted}/{totalTasks} tasks completed</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
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
                selectedWeek === week.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedWeek(week.id)}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold">Week {week.id}</span>
                <span className="text-xs">{progress}%</span>
              </div>
              <div className="text-xs text-left opacity-80">{week.title}</div>
              <div className="w-full bg-gray-200 rounded-full h-1">
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
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Progress: {getWeekProgress(selectedWeekData)}% 
                ({selectedWeekData.days.filter(day => completedTasks.has(day.id)).length}/{selectedWeekData.days.length} completed)
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {selectedWeekData.days.map((day, index) => (
              <div 
                key={day.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  completedTasks.has(day.id) 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(day.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      completedTasks.has(day.id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {completedTasks.has(day.id) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(day.type)}`}>
                        {day.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">Day {index + 1}</span>
                    </div>
                    <h4 className={`font-medium mb-1 ${completedTasks.has(day.id) ? 'line-through text-green-700' : ''}`}>
                      {day.title}
                    </h4>
                    <p className={`text-sm ${completedTasks.has(day.id) ? 'text-green-600' : 'text-muted-foreground'}`}>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['setup', 'practice', 'learn', 'build', 'share'].map((type) => {
          const allTasks = roadmapData.flatMap(w => w.days);
          const typeTasks = allTasks.filter(task => task.type === type);
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
    </div>
  );
}