import {TableDefinitionService} from './../../services/table-definition.service';
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

  active = 'B';

  codeModel: CodeModel;
  fakeModel: CodeModel;
  tableName: string;

  options = {
    contextmenu: true,
    minimap: {
      enabled: false,
    },
  };

  tables: string[] = [];
  homeTables: string[] = [];


  constructor(
    private http: HttpClient,
    private tableDefinitionService: TableDefinitionService,
  ) {
    super();
  }


  ngOnInit(): void {
    super.ngOnInit();

    this.subscribe(this.tableDefinitionService.tableDefinitions, allDefs => {
      this.tables = Object.keys(allDefs);
      this.homeTables = Object.entries(allDefs).filter(([name, def]) => def.showOnHome).map(([name, def]) => name);
    });

    // this.tableDefinitionService.getAllTables().then(tables => {
    //   this.tables = tables;
    //   Promise.all(tables.map(
    //     table => this.tableDefinitionService.getDefinition(table).then(def => [table, def.showOnHome] as [string, boolean])
    //   )).then(data => {
    //     this.homeTables = data.filter(d => d[1]).map(d => d[0]);
    //   });
    // });
    if (isDevMode()) {
      console.log('👋 Development!');
    } else {
      console.log('💪 Production!');
    }
  }

  editTable(tableName: string): void {
    this.codeModel = null;
    this.fakeModel = null;
    this.tableName = null;

    const path = isDevMode() ? '/assets' : '/filmtool/assets';
    Promise.all([
      this.http.get(`${path}/table.${tableName}.json`, {responseType: 'text'}).toPromise(),
      this.http.get(`${path}/index.schema.json`).toPromise(),
    ])
      .then(([def, schema]) => {
        this.tableName = tableName;
        this.codeModel = {
          language: 'json',
          uri: 'main.json',
          value: def,
          schemas: [
            {
              uri: 'http://www.cinbibr.de/test',
              schema
            }
          ]
        };
      });
  }

  editFakeData(tableName: string): void {
    this.codeModel = null;
    this.fakeModel = null;
    this.tableName = null;

    const path = isDevMode() ? '/assets' : '/filmtool/assets';
    this.http.get(`${path}/data.${tableName}.json`, {responseType: 'text'}).toPromise().then(def => {
      console.info(def)
      this.tableName = tableName;
      this.fakeModel = {
        language: 'json',
        uri: 'main.json',
        value: def
      };
      setTimeout(() => {
        console.info(this.fakeModel)
      }, 2000)
    });
  }


  save(): void {
    this.http.post(`http://cinbir.de/filmtool/api.php`, {
      table: this.tableName,
      code: this.codeModel.value,
    }, {responseType: 'text'}).toPromise().then(data => {
      if (data === 'ok') {
        alert('gespeichert, bitte neu laden!');
        this.codeModel = null;
        this.fakeModel = null;
        this.tableName = null;
      }
    });
  }

  saveFakeData(): void {
    this.http.post(`http://cinbir.de/filmtool/api.php`, {
      fakeData: this.tableName,
      code: this.fakeModel.value,
    }, {responseType: 'text'}).toPromise().then(data => {
      if (data === 'ok') {
        alert('gespeichert, bitte neu laden!');
        this.codeModel = null;
        this.fakeModel = null;
        this.tableName = null;
      }
    });
  }


}
