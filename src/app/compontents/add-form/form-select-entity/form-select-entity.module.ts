import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {FormSelectEntityComponent} from './form-select-entity.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    DropdownModule,
  ],
  declarations: [FormSelectEntityComponent],
  exports: [FormSelectEntityComponent],
})
export class FormSelectEntityModule {}
