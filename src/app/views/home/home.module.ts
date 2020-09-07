import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CodeEditorModule} from '@ngstack/code-editor';
import {ButtonModule} from 'primeng/button';
import {HomeComponent} from './home.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    ButtonModule,

    CodeEditorModule,
  ],
  declarations: [HomeComponent],
  exports: [HomeComponent],
})
export class HomeModule { }
