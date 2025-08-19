"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/lib/useAnalytics";

interface WorkflowPattern {
  id: string;
  title: string;
  description: string;
  complexity: 'intermediate' | 'advanced' | 'expert';
  useCase: string;
  implementation: {
    agents: string[];
    workflow: string[];
    coordination: string;
    benefits: string[];
  };
  example: string;
  considerations: string[];
}

const workflowPatterns: WorkflowPattern[] = [
  {
    id: "specialized-teams",
    title: "Specialized Agent Teams",
    description: "Coordinate multiple AI agents with distinct specializations for complex development challenges",
    complexity: "advanced",
    useCase: "Large features requiring architectural planning, implementation, quality assurance, and documentation",
    implementation: {
      agents: [
        "Planning Agent (Claude Code) - Architecture and strategic decisions",
        "Implementation Agent (Cursor) - AI-native development with codebase awareness",
        "Quality Agent (AI Testing Tools) - Automated testing and quality validation", 
        "Documentation Agent (AI Documentation) - Comprehensive project knowledge maintenance"
      ],
      workflow: [
        "Planning Agent establishes architectural framework and technical requirements",
        "Implementation Agent receives enriched context and builds according to specifications",
        "Quality Agent validates implementation against architectural and quality standards",
        "Documentation Agent updates project knowledge and maintains architectural decisions"
      ],
      coordination: "Sequential with feedback loops - each agent can request clarification or revision from previous agents",
      benefits: [
        "Deep specialization in each development phase",
        "Comprehensive quality assurance through specialized review",
        "Maintained architectural coherence across complex implementations",
        "Automated documentation and knowledge preservation"
      ]
    },
    example: "E-commerce platform feature: Planning Agent designs checkout architecture → Implementation Agent builds payment integration → Quality Agent generates comprehensive tests → Documentation Agent updates API documentation and architectural decisions",
    considerations: [
      "Requires sophisticated context management between agents",
      "Initial setup complexity high but scales well for complex projects",
      "Need clear handoff protocols and quality gates between agents"
    ]
  },
  {
    id: "context-automation",
    title: "Context-Aware Automation Chains", 
    description: "AI agents that pass enriched context through automated workflows with minimal human intervention",
    complexity: "expert",
    useCase: "Repetitive complex tasks like legacy refactoring, API migrations, or systematic code improvements",
    implementation: {
      agents: [
        "Analysis Agent - Identifies opportunities and assesses complexity/risk",
        "Strategy Agent - Designs approach with risk assessment and rollback plans",
        "Implementation Agent - Executes changes with automated testing",
        "Validation Agent - Verifies success and measures performance impact"
      ],
      workflow: [
        "Analysis Agent scans codebase and identifies refactoring opportunities with impact assessment",
        "Strategy Agent designs refactoring approach with risk mitigation and testing strategy",
        "Implementation Agent executes refactoring with comprehensive test generation",
        "Validation Agent verifies refactoring success, performance impact, and architectural improvement"
      ],
      coordination: "Automated pipeline with quality gates - human approval required only for high-risk changes",
      benefits: [
        "Systematic handling of complex, repetitive development tasks",
        "Reduced human cognitive load for routine but complex work",
        "Consistent quality and approach across similar challenges",
        "Comprehensive risk assessment and mitigation"
      ]
    },
    example: "Legacy API migration: Analysis Agent identifies deprecated API usage → Strategy Agent designs migration plan → Implementation Agent updates code with new API → Validation Agent confirms functionality and performance",
    considerations: [
      "Requires extensive setup and testing before automation",
      "Need robust rollback and error handling mechanisms", 
      "Human oversight essential for business logic and architectural decisions"
    ]
  },
  {
    id: "iterative-intelligence",
    title: "Iterative Intelligence Amplification",
    description: "AI agents that learn and improve from previous iterations, building domain-specific expertise over time",
    complexity: "expert",
    useCase: "Projects with repetitive patterns where AI can learn and improve approaches based on success/failure feedback",
    implementation: {
      agents: [
        "Learning Agent - Analyzes previous implementations and identifies improvement patterns",
        "Strategy Agent - Applies learned patterns to new challenges with continuous refinement",
        "Implementation Agent - Executes with learned optimizations and pattern matching",
        "Feedback Agent - Measures outcomes and feeds learning back to Learning Agent"
      ],
      workflow: [
        "Learning Agent analyzes historical project data and successful pattern implementations",
        "Strategy Agent applies learned patterns to current challenge with context-specific adaptations",
        "Implementation Agent executes using optimized approaches from previous learning cycles",
        "Feedback Agent measures implementation success and updates learning dataset"
      ],
      coordination: "Continuous learning loop with feedback integration - agents improve over project lifetime",
      benefits: [
        "Continuously improving AI assistance quality over time",
        "Domain-specific expertise development for your codebase and patterns",
        "Reduced need for repetitive human guidance on similar challenges",
        "Compound improvement in development velocity and quality"
      ]
    },
    example: "Component development: Learning Agent identifies successful component patterns → Strategy Agent adapts patterns for new component → Implementation Agent builds optimized component → Feedback Agent measures reuse and quality for future learning",
    considerations: [
      "Requires sophisticated tracking and learning infrastructure",
      "Need careful quality controls to prevent learning from poor examples",
      "Significant upfront investment for long-term compound benefits"
    ]
  },
  {
    id: "collaborative-architecture",
    title: "Collaborative Architecture Design",
    description: "Multiple AI agents collaborate on complex architectural decisions with human strategic oversight",
    complexity: "advanced",
    useCase: "Complex system architecture design, major refactoring decisions, or technical strategy planning",
    implementation: {
      agents: [
        "Requirements Agent - Analyzes business requirements and technical constraints",
        "Design Agent - Proposes architectural solutions with trade-off analysis",
        "Validation Agent - Reviews designs against scalability, maintainability, and security standards",
        "Documentation Agent - Creates comprehensive architectural documentation and decision rationale"
      ],
      workflow: [
        "Requirements Agent analyzes business context, technical constraints, and architectural requirements",
        "Design Agent proposes multiple architectural approaches with detailed trade-off analysis",
        "Validation Agent reviews each proposal against quality standards and long-term maintainability",
        "Documentation Agent creates comprehensive documentation including decision rationale and future considerations"
      ],
      coordination: "Collaborative with human strategic oversight - agents debate approaches while human provides business context and final decisions",
      benefits: [
        "Comprehensive analysis of architectural trade-offs and implications",
        "Multiple perspective evaluation reducing architectural blind spots",
        "Thorough documentation of architectural decisions and rationale",
        "Systematic approach to complex technical decision-making"
      ]
    },
    example: "Microservices migration: Requirements Agent analyzes current system constraints → Design Agent proposes migration strategies → Validation Agent assesses each strategy's risks → Documentation Agent creates migration roadmap with decision rationale",
    considerations: [
      "Requires clear business context and strategic input from humans",
      "Need mechanisms for handling agent disagreement and conflict resolution",
      "Essential to maintain human oversight for business-critical architectural decisions"
    ]
  },
  {
    id: "quality-orchestration",
    title: "Comprehensive Quality Orchestration",
    description: "AI agents that orchestrate multi-dimensional quality assurance beyond traditional testing",
    complexity: "intermediate",
    useCase: "High-stakes development where comprehensive quality validation is essential",
    implementation: {
      agents: [
        "Security Agent - Analyzes code for security vulnerabilities and compliance issues",
        "Performance Agent - Evaluates performance implications and optimization opportunities", 
        "Maintainability Agent - Assesses code maintainability, technical debt, and future modification ease",
        "Integration Agent - Validates integration points and system coherence"
      ],
      workflow: [
        "Security Agent scans implementation for security vulnerabilities and compliance with security standards",
        "Performance Agent analyzes performance implications and identifies optimization opportunities",
        "Maintainability Agent evaluates code maintainability, technical debt implications, and future modification ease",
        "Integration Agent validates system integration points and overall architectural coherence"
      ],
      coordination: "Parallel analysis with consolidated reporting - all agents analyze simultaneously and provide integrated quality assessment",
      benefits: [
        "Comprehensive quality validation across multiple dimensions",
        "Early identification of quality issues before deployment",
        "Systematic approach to technical debt and maintainability assessment",
        "Integrated quality reporting for informed decision-making"
      ]
    },
    example: "API development: Security Agent validates authentication/authorization → Performance Agent analyzes response times → Maintainability Agent reviews code structure → Integration Agent confirms API contract compliance",
    considerations: [
      "Need clear quality standards and thresholds for each dimension",
      "Requires integration with existing CI/CD and quality assurance processes",
      "Must balance comprehensive analysis with development velocity"
    ]
  }
];

export function AdvancedWorkflowPatterns() {
  const [selectedPattern, setSelectedPattern] = useState<string>(workflowPatterns[0]?.id || '');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['implementation']));
  const { trackEvent } = useAnalytics();

  const currentPattern = workflowPatterns.find(p => p.id === selectedPattern) || workflowPatterns[0];

  if (!currentPattern) {
    return <div>Loading...</div>;
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    const wasExpanded = newExpanded.has(section);
    
    if (wasExpanded) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
      
      // Track section expansion
      trackEvent('workflow_section_expanded', {
        article: 'advanced_workflows',
        pattern_id: selectedPattern,
        section: section as 'implementation' | 'example' | 'considerations'
      });
    }
    
    setExpandedSections(newExpanded);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'intermediate': return 'bg-secondary text-foreground border-border';
      case 'advanced': return 'bg-muted/50 text-foreground border-border';
      case 'expert': return 'bg-secondary/70 text-foreground border-border';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">🧠 Advanced AI Orchestration Patterns</h3>
        <p className="text-muted-foreground">
          Explore sophisticated multi-agent workflows for complex development challenges
        </p>
      </div>

      {/* Pattern Selection */}
      <div className="grid gap-3">
        {workflowPatterns.map((pattern) => (
          <Button
            key={pattern.id}
            variant={selectedPattern === pattern.id ? "default" : "outline"}
            className={`h-auto p-4 text-left justify-start ${
              selectedPattern === pattern.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              setSelectedPattern(pattern.id);
              
              // Track pattern selection
              trackEvent('workflow_pattern_selected', {
                article: 'advanced_workflows',
                pattern_id: pattern.id,
                pattern_title: pattern.title,
                complexity: pattern.complexity as 'intermediate' | 'advanced' | 'expert'
              });
            }}
          >
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{pattern.title}</span>
                <Badge className={getComplexityColor(pattern.complexity)}>
                  {pattern.complexity}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground text-left">
                {pattern.description}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Selected Pattern Details */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">{currentPattern.title}</h3>
              <p className="text-muted-foreground mb-4">{currentPattern.description}</p>
            </div>
            <Badge className={getComplexityColor(currentPattern.complexity)}>
              {currentPattern.complexity.toUpperCase()}
            </Badge>
          </div>

          {/* Use Case */}
          <div className="bg-muted/20 p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-2">🎯 Primary Use Case</h4>
            <p className="text-sm">{currentPattern.useCase}</p>
          </div>

          {/* Implementation Details */}
          <div>
            <Button
              variant="ghost"
              onClick={() => toggleSection('implementation')}
              className="w-full justify-between p-0 h-auto"
            >
              <h4 className="font-semibold">🔧 Implementation Framework</h4>
              <span>{expandedSections.has('implementation') ? '−' : '+'}</span>
            </Button>
            
            {expandedSections.has('implementation') && (
              <div className="mt-4 space-y-4">
                {/* Agents */}
                <div>
                  <h5 className="font-medium mb-2">AI Agents</h5>
                  <ul className="space-y-2">
                    {currentPattern.implementation.agents.map((agent, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="mr-2 text-link">•</span>
                        <span>{agent}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Workflow */}
                <div>
                  <h5 className="font-medium mb-2">Workflow Steps</h5>
                  <ol className="space-y-2">
                    {currentPattern.implementation.workflow.map((step, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="mr-2 text-link font-bold">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Coordination */}
                <div>
                  <h5 className="font-medium mb-2">Agent Coordination</h5>
                  <p className="text-sm bg-secondary/30 p-3 rounded-lg border border-border">{currentPattern.implementation.coordination}</p>
                </div>

                {/* Benefits */}
                <div>
                  <h5 className="font-medium mb-2">Key Benefits</h5>
                  <ul className="space-y-1">
                    {currentPattern.implementation.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="mr-2 text-link">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Example */}
          <div>
            <Button
              variant="ghost"
              onClick={() => toggleSection('example')}
              className="w-full justify-between p-0 h-auto"
            >
              <h4 className="font-semibold">💡 Real-World Example</h4>
              <span>{expandedSections.has('example') ? '−' : '+'}</span>
            </Button>
            
            {expandedSections.has('example') && (
              <div className="mt-4 bg-muted/20 p-4 rounded-lg border border-border">
                <p className="text-sm">{currentPattern.example}</p>
              </div>
            )}
          </div>

          {/* Considerations */}
          <div>
            <Button
              variant="ghost"
              onClick={() => toggleSection('considerations')}
              className="w-full justify-between p-0 h-auto"
            >
              <h4 className="font-semibold">⚠️ Implementation Considerations</h4>
              <span>{expandedSections.has('considerations') ? '−' : '+'}</span>
            </Button>
            
            {expandedSections.has('considerations') && (
              <div className="mt-4">
                <ul className="space-y-2">
                  {currentPattern.considerations.map((consideration, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="mr-2 text-muted-foreground">▲</span>
                      <span>{consideration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Implementation Guide */}
      <div className="bg-secondary/30 rounded-lg p-6 border border-border">
        <h4 className="font-semibold mb-3">🚀 Getting Started with Advanced Patterns</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium mb-2">Start Simple</h5>
            <ul className="space-y-1">
              <li>• Begin with Quality Orchestration pattern</li>
              <li>• Master single-agent workflows first</li>
              <li>• Build systematic context management</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Scale Complexity</h5>
            <ul className="space-y-1">
              <li>• Add Specialized Teams for complex features</li>
              <li>• Experiment with Context Automation chains</li>
              <li>• Design custom patterns for your domain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}