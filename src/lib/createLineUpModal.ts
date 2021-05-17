import {IModify, IPersistence} from '@rocket.chat/apps-engine/definition/accessors';
import {RocketChatAssociationModel, RocketChatAssociationRecord} from '@rocket.chat/apps-engine/definition/metadata';
import {IUIKitModalViewParam} from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';

import {ButtonStyle} from '@rocket.chat/apps-engine/definition/uikit';
import {IUser} from '@rocket.chat/apps-engine/definition/users';
import {IModalContext} from '../definition';
import {uuid} from './uuid';

export async function createLineupModal({ id = '', persistence, data, modify, tasks = 1, members }: {
    id?: string,
    persistence: IPersistence,
    data: IModalContext,
    modify: IModify,
    tasks?: number,
    members: Array<IUser>,
}): Promise<IUIKitModalViewParam> {
    const viewId = id || uuid();

    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, viewId);
    await persistence.createWithAssociation(data, association);
    const block = modify.getCreator().getBlockBuilder();

    block.addImageBlock({
        blockId: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1524862655266-89c67a10c4b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        altText: 'image'});
    block.addContextBlock({
        blockId: 'test',
        elements: [
            block.newPlainTextObject('You have to write one users task atleast. ✏️ '),
        ],
    });

    for (let i = 0; i < tasks; i++) {
       const noOfTask = 1;
       block.addActionsBlock({
                blockId: 'config',
                elements: [
                    block.newStaticSelectElement({
                        placeholder: block.newPlainTextObject('username'),
                        actionId: `user-${i}`,
                        initialValue: 'rocket.cat',
                        options: members.map((member) => ({
                            text: block.newPlainTextObject(member.username),
                            value: member.username,
                        })),
                    }),
                ],
            });
       block.addInputBlock({
                blockId: 'task',
                optional: true,
                element: block.newPlainTextInputElement({
                    actionId: `task-${i}`,
                    placeholder: block.newPlainTextObject( 'write the task here'),
                }),
                label: block.newPlainTextObject('Task'),
            });
       block.addDividerBlock();

    }

    block.addActionsBlock({
        blockId: 'add-task',
        elements: [
            block.newButtonElement({
                actionId: 'add-task',
                text: block.newMarkdownTextObject('Add tasks ➕'),
                value: String(tasks + 1),
                style: ButtonStyle.PRIMARY,
            }),

        ],
    });

    return {
        id: viewId,
        title: block.newPlainTextObject('Create Lineup'),
        submit: block.newButtonElement({
            text: block.newPlainTextObject('Create'),
            style: ButtonStyle.DANGER,
        }),
        close: block.newButtonElement({
            text: block.newPlainTextObject('Dismiss'),
        }),
        blocks: block.getBlocks(),
    };
}
