import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DialogData } from "src/app/Models/DialogData";

@Component({
    selector: 'dialog-view',
    templateUrl: './dialogView.html'
})
export class DialogView {
    constructor(
        public dialogRef: MatDialogRef<DialogView>,
        @Inject(MAT_DIALOG_DATA)public data: DialogData
    ) {}

    onCloseDialog(): void {
        this.dialogRef.close();
    }
}