import {FormSelectEntityModule} from './form-select-entity/form-select-entity.module';
import {FormSelectSimpleModule} from './form-select-simple/form-select-simple.module';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {PanelModule} from 'primeng/panel';
import {AddFormComponent} from './add-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    FormSelectSimpleModule,
    FormSelectEntityModule,

    PanelModule,
    ButtonModule,
    InputTextModule,
  ],
  declarations: [
    AddFormComponent
  ],
  entryComponents: [
    AddFormComponent
  ]
})
export class AddFormModule {}
