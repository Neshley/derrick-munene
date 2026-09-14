import { track } from '@vercel/analytics';

/**
 * Centralized product analytics for the web deployment.
 * Vercel Web Analytics ignores these calls outside production, so the
 * workstation remains quiet during local development.
 */
export type AnalyticsEvent =
  | 'app_loaded'
  | 'performance_started'
  | 'performance_stopped'
  | 'style_creator_opened'
  | 'style_saved'
  | 'style_exported'
  | 'style_imported'
  | 'style_generated'
  | 'ai_feature_used';

export function trackEvent(
  name: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>,
): void {
  try {
    void track(name, properties);
  } catch {
    // Analytics must never interfere with music/workstation behavior.
  }
}
