import { createInMemoryWorkspace, createCommandRegistry, type KonitifWorkspaceSnapshot } from '@konitif/core';

const workspace = createInMemoryWorkspace({ id: 'consumer' });
const snapshot: KonitifWorkspaceSnapshot = workspace.getSnapshot();
const registry = createCommandRegistry<{ label: string }>();
registry.register({ id: 'rename', title: 'Rename', run: context => { workspace.update({ name: context.label }); } });
await registry.run('rename', { label: snapshot.name });
// @ts-expect-error Workspace updates must not replace identity.
workspace.update({ id: 'invalid' });
