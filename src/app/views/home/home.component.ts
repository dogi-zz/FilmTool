import {TableDefinitionService, TableDefinition} from './../../services/table-definition.service';
import {Component, OnInit, isDevMode} from '@angular/core';
import {CodeModel} from '@ngstack/code-editor';
import {HttpClient} from '@angular/common/http';
import {BaseComponent} from '../../tools/base-component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponent implements OnInit {

  homeTables: [string, TableDefinition][] = [];

  constructor(
    private tableDefinitionService: TableDefinitionService,
  ) {
    super();
  }


  ngOnInit(): void {
    super.ngOnInit();

    this.subscribe(this.tableDefinitionService.tableDefinitions$, allDefs => {
      this.homeTables = Object.entries(allDefs).filter(([name, def]) => def.showOnHome);
    });

    if (isDevMode()) {
      console.log('👋 Development!');
    } else {
      console.log('💪 Production!');
    }
  }

  


}
