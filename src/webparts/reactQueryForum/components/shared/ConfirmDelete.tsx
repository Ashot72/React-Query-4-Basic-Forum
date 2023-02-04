import * as React from 'react';
import * as strings from 'ReactQueryForumWebPartStrings';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

interface ConfirmDeleteProp {
    title: string
    onDelete: (shouldDelete: boolean) => void
}

const ConfirmDelete: React.FC<ConfirmDeleteProp> = ({ title, onDelete }) =>
    <Dialog
        hidden={false}
        onDismiss={e => onDelete(false)}
        dialogContentProps={{
            type: DialogType.normal,
            title: strings.Confirm,
            subText: `${title} `
        }}
        modalProps={{
            isBlocking: true,
            containerClassName: 'ms-dialogMainOverride'
        }}
    >
        <DialogFooter>
            <PrimaryButton onClick={e => onDelete(true)} text={strings.Delete} />
            <DefaultButton onClick={e => onDelete(false)} text={strings.Cancel} />
        </DialogFooter>
    </Dialog>

export default ConfirmDelete