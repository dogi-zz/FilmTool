import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CodeEditorModule} from '@ngstack/code-editor';
import {AdminComponent} from './admin.component';
import {NzButtonModule} from 'ng-zorro-antd/button';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    NzButtonModule,

    CodeEditorModule,
  ],
  declarations: [AdminComponent],
  exports: [AdminComponent],
})
export class AdminModule { }
