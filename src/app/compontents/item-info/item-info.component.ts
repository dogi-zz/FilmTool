import {DataService} from './../../services/data.service';
import {TableDefinitionService, TableDefinition, TableDefinitionItem} from './../../services/table-definition.service';
import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {query} from '@angular/animations';

interface AdditinalInfo {
  name: string;
  cols: string[];
}

@Component({
  selector: 'app-item-info',
  templateUrl: './item-info.component.html',
  styleUrls: ['./item-info.component.scss']
})
export class ItemInfoComponent implements OnInit, OnChanges {

  @Input()
  item: any;

  @Input()
  tableName: string;

  title: string;
  definitions: TableDefinitionItem[] = [];

  additionalInfos: Promise<AdditinalInfo>[];

  constructor(
    private tableDefinitionService: TableDefinitionService,
    private dataService: DataService,
  ) {}


  ngOnInit(): void {
    this.update();

  }
  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  update(): void {
    this.tableDefinitionService.tableDefinitions$.subscribe(definitions => {
      const tableName = this.tableName;
      const definition = definitions[tableName];

      this.title = this.tableDefinitionService.stringify(this.tableName, this.item);
      this.definitions = definition.columns;

      this.additionalInfos = [];
      definition.infoQueries.forEach(query => {
        this.additionalInfos.push(this.getAdditional(query))
      });

    });
  }


  // getValue(definitionItem: TableDefinitionItem): Promise<any> {
  //   const value = this.item[definitionItem.name];
  //   if (definitionItem.type === 'relation' && value) {
  //     return this.dataService.fetchData<any>(definitionItem.table).then(allItems => {
  //       const childItem = allItems.find(item => item.id === value);
  //       return this.tableDefinitionService.stringify(definitionItem.table, childItem);
  //     });
  //   } else {
  //     return Promise.resolve(value);
  //   }
  // }

  getAdditional(query: {name: string; query: {select: [string, string][];};}): Promise<AdditinalInfo> {
    return Promise.resolve({
      name: query.name,
      cols: query.query.select.map(s => s[1])
    });
  }
}
