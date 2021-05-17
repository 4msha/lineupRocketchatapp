import { IUIKitBlockIncomingInteraction } from '@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes';


export interface ITask {
    user: string;
    task: string;
}

export interface ILineUp {
    msgId: string;
    uid: string; // user who assigned the task
    quote: string;
    tasks: Array<ITask>;
}

export interface IModalContext extends Partial<IUIKitBlockIncomingInteraction> {
    threadId?: string;
}
