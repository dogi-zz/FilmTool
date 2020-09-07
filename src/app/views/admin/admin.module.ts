import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CodeEditorModule} from '@ngstack/code-editor';
import {ButtonModule} from 'primeng/button';
import {AdminComponent} from './admin.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    ButtonModule,

    CodeEditorModule,
  ],
  declarations: [AdminComponent],
  exports: [AdminComponent],
})
export class AdminModule { }
