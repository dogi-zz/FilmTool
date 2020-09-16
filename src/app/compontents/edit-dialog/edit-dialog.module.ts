import {FormSelectSimpleModule} from './../form-select-simple/form-select-simple.module';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {SharedModule} from 'primeng/api';
import {EditDialogComponent} from './edit-dialog.component';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzSelectModule} from 'ng-zorro-antd/select';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,

    FormSelectSimpleModule,

    NzModalModule,
    NzInputModule,
    NzButtonModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzSelectModule,
  ],
  declarations: [EditDialogComponent],
  exports: [EditDialogComponent],
})
export class EditDialogModule {}
