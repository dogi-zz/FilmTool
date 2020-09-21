import {TableDefinitionService} from './services/table-definition.service';
import {Component, OnInit} from '@angular/core';

// https://ng.ant.design/docs/introduce/en

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isCollapsed = false;

  homeTables: string[];

  constructor(
    private tableDefinitionService: TableDefinitionService,
  ) {}

  ngOnInit(): void {
    this.tableDefinitionService.tableDefinitions$.subscribe(allDefs => {
      this.homeTables = Object.entries(allDefs).filter(([name, def]) => def.showOnHome).map(([name, def]) => name);
    });
  }


}
