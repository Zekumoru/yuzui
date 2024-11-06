export interface DiscordEvent {
  name: string;
  once?: boolean;
  execute: (...data: unknown[]) => Promise<void> | void;
}

export const createEvent = (event: DiscordEvent) => event;
