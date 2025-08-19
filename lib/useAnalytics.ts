"use client";

import { usePlausible } from "next-plausible";
import { useCallback } from "react";

// Event categories and types for the AI Development Mastery series
export interface AnalyticsEvents {
  // Quiz Events
  'quiz_started': {
    article: 'assessment';
  };
  'quiz_completed': {
    article: 'assessment';
    mastery_level: 'ai_curious' | 'ai_integrated' | 'ai_orchestrating';
    score: number;
  };
  'quiz_level_discovered': {
    article: 'assessment';
    level: 'ai_curious' | 'ai_integrated' | 'ai_orchestrating';
    user_expectation?: 'expected' | 'higher_than_expected' | 'lower_than_expected';
  };

  // Tool Selector Events
  'tool_selector_started': {
    article: 'tool_selection';
  };
  'tool_selector_completed': {
    article: 'tool_selection';
    experience_level: string;
    project_type: string;
    team_size: string;
    recommended_stack: string;
  };
  'tool_recommendation_generated': {
    article: 'tool_selection';
    primary_tools: string;
    workflow_type: string;
  };

  // Roadmap Timeline Events
  'roadmap_week_expanded': {
    article: 'transformation_guide';
    week: 1 | 2 | 3 | 4;
    week_title: string;
  };
  'roadmap_day_clicked': {
    article: 'transformation_guide';
    day: number;
    week: number;
    activity_type: string;
  };
  'roadmap_milestone_viewed': {
    article: 'transformation_guide';
    milestone: string;
    week: number;
  };

  // Advanced Workflow Pattern Events
  'workflow_pattern_selected': {
    article: 'advanced_workflows';
    pattern_id: string;
    pattern_title: string;
    complexity: 'intermediate' | 'advanced' | 'expert';
  };
  'workflow_section_expanded': {
    article: 'advanced_workflows';
    pattern_id: string;
    section: 'implementation' | 'example' | 'considerations';
  };

  // Source and Reference Events
  'source_clicked': {
    article: string;
    source_id: number;
    source_title: string;
  };
  'external_source_visited': {
    article: string;
    source_id: number;
    source_url: string;
    source_type: 'research' | 'survey' | 'report';
  };
  'sources_section_viewed': {
    article: string;
    source_count: number;
  };

  // Navigation Events
  'series_article_visited': {
    article: string;
    article_number: number;
    from_article?: string;
  };
  'series_navigation_used': {
    from_article: string;
    to_article: string;
    navigation_type: 'next_button' | 'previous_button' | 'series_nav' | 'footer_nav';
  };
  'article_completion': {
    article: string;
    completion_method: 'scroll' | 'time_based';
    reading_time_seconds: number;
  };

  // Learning Outcome Events
  'mastery_assessment_result': {
    level: 'ai_curious' | 'ai_integrated' | 'ai_orchestrating';
    score: number;
    improvement_areas: string;
  };
  'tool_adoption_intent': {
    article: 'tool_selection';
    recommended_tools: string;
    intent_level: 'will_try' | 'considering' | 'not_interested';
  };
  'implementation_plan_started': {
    article: 'transformation_guide';
    starting_level: string;
    target_level: string;
  };

  // Series Progress Events
  'series_completion': {
    completion_rate: number;
    articles_read: number;
    time_to_complete_hours: number;
  };
  'series_drop_off': {
    last_article: string;
    articles_completed: number;
  };
}

export type EventName = keyof AnalyticsEvents;
export type EventProps<T extends EventName> = AnalyticsEvents[T];

export function useAnalytics() {
  const plausible = usePlausible();

  const trackEvent = useCallback(
    <T extends EventName>(
      eventName: T,
      props: EventProps<T>,
      options?: {
        callback?: () => void;
        revenue?: { currency: string; amount: number };
      }
    ) => {
      try {
        // Log events in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Analytics Event:', eventName, props);
        }

        plausible(eventName, {
          props: props as Record<string, string | number | boolean>,
          callback: options?.callback,
          revenue: options?.revenue,
        });
      } catch (error) {
        console.error('Analytics tracking error:', error);
      }
    },
    [plausible]
  );

  // Convenience methods for common event patterns
  const trackQuizEvent = useCallback(
    (
      eventType: 'started' | 'completed' | 'level_discovered',
      additionalProps: Partial<EventProps<'quiz_completed'>>
    ) => {
      const baseProps = { article: 'assessment' as const };
      
      switch (eventType) {
        case 'started':
          trackEvent('quiz_started', baseProps);
          break;
        case 'completed':
          trackEvent('quiz_completed', { 
            ...baseProps, 
            ...additionalProps 
          } as EventProps<'quiz_completed'>);
          break;
        case 'level_discovered':
          trackEvent('quiz_level_discovered', { 
            ...baseProps, 
            ...additionalProps 
          } as EventProps<'quiz_level_discovered'>);
          break;
      }
    },
    [trackEvent]
  );

  const trackSourceInteraction = useCallback(
    (
      interactionType: 'clicked' | 'external_visited' | 'section_viewed',
      props: {
        article: string;
        sourceId?: number;
        sourceTitle?: string;
        sourceUrl?: string;
        sourceType?: 'research' | 'survey' | 'report';
        sourceCount?: number;
      }
    ) => {
      switch (interactionType) {
        case 'clicked':
          trackEvent('source_clicked', {
            article: props.article,
            source_id: props.sourceId!,
            source_title: props.sourceTitle!,
          });
          break;
        case 'external_visited':
          trackEvent('external_source_visited', {
            article: props.article,
            source_id: props.sourceId!,
            source_url: props.sourceUrl!,
            source_type: props.sourceType!,
          });
          break;
        case 'section_viewed':
          trackEvent('sources_section_viewed', {
            article: props.article,
            source_count: props.sourceCount!,
          });
          break;
      }
    },
    [trackEvent]
  );

  const trackSeriesNavigation = useCallback(
    (
      fromArticle: string,
      toArticle: string,
      navigationType: 'next_button' | 'previous_button' | 'series_nav' | 'footer_nav'
    ) => {
      trackEvent('series_navigation_used', {
        from_article: fromArticle,
        to_article: toArticle,
        navigation_type: navigationType,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackQuizEvent,
    trackSourceInteraction,
    trackSeriesNavigation,
  };
}

// Utility function to get article slug from current path
export function getArticleSlug(pathname: string): string {
  const segments = pathname.split('/');
  return segments[segments.length - 1] || 'unknown';
}

// Utility function to map article slugs to readable names
export function getArticleName(slug: string): string {
  const articleMap: Record<string, string> = {
    'ai-development-assessment': 'assessment',
    'ai-tool-selection-matrix': 'tool_selection',
    '30-day-transformation-guide': 'transformation_guide',
    'advanced-ai-workflows': 'advanced_workflows',
    'ai-development-mastery-series': 'series_overview',
  };
  
  return articleMap[slug] || slug;
}