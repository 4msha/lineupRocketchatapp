import {IHttp, IModify, IPersistence, IRead} from '@rocket.chat/apps-engine/definition/accessors';
import {RocketChatAssociationModel, RocketChatAssociationRecord} from '@rocket.chat/apps-engine/definition/metadata';
import {IRoom} from '@rocket.chat/apps-engine/definition/rooms';
import {IUIKitViewSubmitIncomingInteraction} from '@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes';
import {IModalContext, ITask} from '../definition';
import {createLineupBlocks} from './createLineUpBlock';

export async function createLineupMessage(data: IUIKitViewSubmitIncomingInteraction, http: IHttp, read: IRead, modify: IModify, persistence: IPersistence, uid: string) {
    const { view: { id } } = data;
    const { state }: {
        state?: any;
    } = data.view;

    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, id);
    const [record] = await read.getPersistenceReader().readByAssociation(association) as Array<IModalContext>;

    if (!record.room) {
        throw new Error('Invalid room');
    }
    const users = Object.entries<any>(state.config || {});

    const tasks: Array<ITask> = [];

    users.forEach((user) => {
        // tslint:disable-next-line:no-shadowed-variable
        const id = user[0][user[0].length - 1];
        const taskId = `task-${id}`;
        const task = state.task[taskId];

        const userTask: ITask = {
            user: user[1],
            task,
        };
        tasks.push(userTask);
    });

    if (!users.length) {
        throw {
            'user-0': 'Please provide a user',
            'task-0': 'Please write the task here',
        };
    }

    try {

        const showNames = await read.getEnvironmentReader().getSettings().getById('use-user-name');

        const builder = modify.getCreator().startMessage()
            .setUsernameAlias((showNames.value && data.user.name) || data.user.username)
            .setRoom(record.room as IRoom);

        const quote = await http.get('http://quotes.stormconsultancy.co.uk/random.json') || { data: { quote: 'The suspension of disbelieve for the moment, is the poetic faith,which is what needed while doing recursion.'}} ;
        const block = modify.getCreator().getBlockBuilder();
        const quote1: string = quote.data.quote;
        block.addSectionBlock({
            text: block.newPlainTextObject(` 🖋️ " ${quote1} "`),
        });

        block.addContextBlock({
            blockId: 'test',
            elements: [
                block.newPlainTextObject(`See your task for today. 👉 `),
            ],
        });
        createLineupBlocks(block, tasks);
        builder.setBlocks(block);
        await modify.getCreator().finish(builder);
    } catch (e) {
        console.log('erorr', {e});
        throw e;
    }
// tslint:disable-next-line:no-empty
}
