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
    } else if (this.definition.type === 'date') {
      const date = this.value as Date;
      if (date) {
        const dayValue = date.getDate();
        const dayString = (dayValue < 10 ? '0' : '') + dayValue;
        const monthValue = date.getMonth() + 1;
        const monthString = (monthValue < 10 ? '0' : '') + monthValue;
        this.viewValue = Promise.resolve(`${dayString}.${monthString}.${date.getFullYear()}`);
      } else {
        this.viewValue = Promise.resolve(null);
      }
    } else {
      this.viewValue = Promise.resolve(this.value);
    }
  }

}
