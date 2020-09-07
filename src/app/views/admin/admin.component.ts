import {DataService} from './../../services/data.service';
import {TableDefinitionService} from '../../services/table-definition.service';
import {Component, OnInit, isDevMode} from '@angular/core';
import {CodeModel} from '@ngstack/code-editor';
import {HttpClient} from '@angular/common/http';
import {BaseComponent} from '../../tools/base-component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent extends BaseComponent implements OnInit {

  structureModel: CodeModel;
  fakeModel: CodeModel;
  tableName: string;

  options = {
    contextmenu: true,
    minimap: {
      enabled: false,
    },
  };

  tables: string[] = [];


  constructor(
    private http: HttpClient,
    private tableDefinitionService: TableDefinitionService,
    private dataService: DataService,
  ) {
    super();
  }


  ngOnInit(): void {
    super.ngOnInit();

    this.subscribe(this.tableDefinitionService.tableDefinitions$, allDefs => {
      this.tables = Object.keys(allDefs);
    });
  }

  editStructure(tableName: string): void {
    this.structureModel = null;
    this.fakeModel = null;
    this.tableName = null;

    const path = isDevMode() ? '/assets' : '/filmtool/assets';
    Promise.all([
      //this.http.get(`${path}/table.${tableName}.json`, {responseType: 'text'}).toPromise(),
      this.http.get(`${path}/index.schema.json`).toPromise(),
    ])
      .then(([schema]) => {
        const tableDefinition = this.tableDefinitionService.getDefinitionSrc(tableName);
        this.tableName = tableName;
        this.structureModel = {
          language: 'json',
          uri: 'main.json',
          value: tableDefinition,
          schemas: [
            {
              uri: 'http://www.cinbir.de/test',
              schema
            }
          ]
        };
      });
  }

  editFakeData(tableName: string): void {
    this.structureModel = null;

    const tableData = this.dataService.getDataSrc(tableName);
    this.tableName = tableName;
    this.fakeModel = {
      language: 'csv',
      uri: 'main.csv',
      value: tableData,
      schemas: [],
    };
  }


  saveStructrue(): void {
    this.tableDefinitionService.updateDefinitionSrc(this.tableName, this.structureModel.value);
    this.structureModel = null;
    this.fakeModel = null;
    this.tableName = null;
  }

  saveFakeData(): void {
    this.dataService.updateDataSrc(this.tableName, this.fakeModel.value);
    this.structureModel = null;
    this.fakeModel = null;
    this.tableName = null;
  }

}
