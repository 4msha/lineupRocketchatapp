import {
    IAppAccessors,
    IConfigurationExtend,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import {SettingType} from '@rocket.chat/apps-engine/definition/settings';
import {
    IUIKitInteractionHandler,
    UIKitBlockInteractionContext,
    UIKitViewSubmitInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import {createLineupMessage} from './src/lib/createLineUpMessage';
import {createLineupModal} from './src/lib/createLineUpModal';
import { LineupCommand } from './src/LineupCommand';

export class LineupApp extends App implements IUIKitInteractionHandler {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }
    public async executeViewSubmitHandler(context: UIKitViewSubmitInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
        const data = context.getInteractionData();
        const { state }: {
            state: {
                lineup: {
                    quote: string,
                    tasks: {
                      user: string,
                      task: string,
                    },
                },
            },
        } = data.view as any;

        try {
            await createLineupMessage(data, http, read, modify, persistence, data.user.id);
        } catch (err) {
            return context.getInteractionResponder().viewErrorResponse({
                viewId: data.view.id,
                errors: err,
            });
        }
        return {
            success: true,
        };
    }

    // @ts-ignore
    public async executeBlockActionHandler(context: UIKitBlockInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
        const data = context.getInteractionData();
        const responder = context.getInteractionResponder();

        const { actionId } = data;
        const  members: Array<any> = await read.getRoomReader().getMembers(data.room?.id as string);

        switch (actionId) {
            case 'add-task': {
                const modal = await createLineupModal({
                    members,
                    id: data.container.id,
                    data, persistence,
                    modify,
                    tasks: parseInt(String(data.value), 10) });
                return context.getInteractionResponder().updateModalViewResponse(modal);
            }

        }
    }

    public async initialize(configuration: IConfigurationExtend): Promise<void> {
        await configuration.slashCommands.provideSlashCommand(new LineupCommand());
        await configuration.settings.provideSetting({
            id : 'use-user-name',
            i18nLabel: 'Use name attribute to display users',
            required: false,
            type: SettingType.BOOLEAN,
            public: true,
            packageValue: false,
        });
    }

}
