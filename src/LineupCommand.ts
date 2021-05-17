import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';

import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';

import {createLineupModal} from './lib/createLineUpModal';

export class LineupCommand  implements ISlashCommand {
    public command = 'lineup';
    public i18nParamsExample = '';
    public i18nDescription = '';
    public providesPreview = false;

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const triggerId = context.getTriggerId();
        const data = {
            room: (context.getRoom() as any).value,
            threadId: context.getThreadId(),
        };
        const  members: Array<any> = await read.getRoomReader().getMembers(data.room.id);

        if (triggerId) {
            const modal = await createLineupModal({ persistence: persis, modify, data, members });

            await modify.getUiController().openModalView(modal, { triggerId }, context.getSender());
        }
        return Promise.resolve(undefined);
    }
}
