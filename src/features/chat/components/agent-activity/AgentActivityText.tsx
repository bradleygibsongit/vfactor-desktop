/**
 * AgentActivityText - Displays intermediate text from the agent.
 *
 * This is the agent's "thinking out loud" text that appears
 * within the working section before the final response.
 */

import { cn } from "@/lib/utils";

interface AgentActivityTextProps {
  text: string;
  className?: string;
}

export function AgentActivityText({ text, className }: AgentActivityTextProps) {
  if (!text.trim()) return null;

  return (
    <div className={cn("text-sm text-foreground", className)}>
      {text}
    </div>
  );
}
