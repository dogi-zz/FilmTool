import {DataService} from './../../services/data.service';
import {TableDefinitionItem, TableDefinitionService} from './../../services/table-definition.service';
import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-field-view',
  templateUrl: './field-view.component.html',
  styleUrls: ['./field-view.component.scss']
})
export class FieldViewComponent implements OnInit {

  @Input()
  definition: TableDefinitionItem;

  @Input()
  value: any;

  viewValue: Promise<any>;

  constructor(
    private tableDefinitionService: TableDefinitionService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    if (this.definition.type === 'oneOf') {
      this.viewValue = this.dataService.getItem(this.definition.table, this.value).then(item => {
        return this.tableDefinitionService.stringify(this.definition.table, item);
      });
    } else {
      this.viewValue = Promise.resolve(this.value);
    }
  }

}
