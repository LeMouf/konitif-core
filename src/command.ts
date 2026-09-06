export interface KonitifCommand<Context = unknown> {
  id: string;
  title: string;
  description?: string;
  run(context: Context): void | Promise<void>;
  enabled?: (context: Context) => boolean;
}

export interface KonitifCommandRegistry<Context = unknown> {
  register(command: KonitifCommand<Context>): KonitifCommandRegistry<Context>;
  unregister(commandId: string): boolean;
  get(commandId: string): KonitifCommand<Context> | undefined;
  list(): KonitifCommand<Context>[];
  run(commandId: string, context: Context): Promise<void>;
}

export function createCommandRegistry<Context = unknown>(
  initialCommands: KonitifCommand<Context>[] = []
): KonitifCommandRegistry<Context> {
  const commands = new Map<string, KonitifCommand<Context>>();

  const registry: KonitifCommandRegistry<Context> = {
    register(command) {
      const normalizedCommand = normalizeCommand(command);
      commands.set(normalizedCommand.id, normalizedCommand);
      return registry;
    },

    unregister(commandId) {
      return commands.delete(commandId.trim());
    },

    get(commandId) {
      return commands.get(commandId.trim());
    },

    list() {
      return [...commands.values()];
    },

    async run(commandId, context) {
      const command = registry.get(commandId);

      if (!command) {
        throw new Error(`Unknown KONITIF command "${commandId}".`);
      }

      if (command.enabled && !command.enabled(context)) {
        throw new Error(`KONITIF command "${commandId}" is disabled.`);
      }

      await command.run(context);
    }
  };

  for (const command of initialCommands) {
    registry.register(command);
  }

  return registry;
}

function normalizeCommand<Context>(command: KonitifCommand<Context>): KonitifCommand<Context> {
  const id = command.id.trim();
  const title = command.title.trim();

  if (!id) {
    throw new Error('Missing KONITIF command id.');
  }

  if (!title) {
    throw new Error('Missing KONITIF command title.');
  }

  return {
    ...command,
    id,
    title
  };
}
