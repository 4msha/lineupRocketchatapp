import { BlockBuilder, BlockElementType } from '@rocket.chat/apps-engine/definition/uikit';
import {ILineUp, ITask} from '../definition';

export function createLineupBlocks(block: BlockBuilder, tasks: Array<ITask>) {

    tasks.forEach((task, index) => {
        block.addSectionBlock({
            text: block.newPlainTextObject(` @${task.user} ➡  ${task.task}`),
        });
        block.addDividerBlock();
    });

}
