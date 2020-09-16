import {DataService} from './../../../services/data.service';
import {TableDefinitionService} from './../../../services/table-definition.service';
import {TableDefinitionItem} from '../../../services/table-definition.service';
import {Component, OnInit, OnChanges, Input, forwardRef, SimpleChanges} from '@angular/core';
import {SelectItem} from 'primeng/api';
import {FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup} from '@angular/forms';

export const CHECKBOX_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FormSelectEntityComponent),
  multi: true,
};

@Component({
  selector: 'app-form-select-entity',
  templateUrl: './form-select-entity.component.html',
  styleUrls: ['./form-select-entity.component.scss'],
  providers: [CHECKBOX_VALUE_ACCESSOR],
})
export class FormSelectEntityComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input()
  definition: TableDefinitionItem;

  @Input()
  formGroup: FormGroup = new FormGroup({value: new FormControl()});

  options: SelectItem[];
  onChange: any;

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

  async update(): Promise<void> {
    const data = await this.dataService.getDataForTable<any>(this.definition.table);
    const options: SelectItem[] = [{label: 'nix', value: null}];
    data.map(async item => {
      const label = await this.tableDefinitionService.stringify(this.definition.table, item);
      options.push({
        label,
        value: item.id,
      });
    });
    this.options = options;
  }

  writeValue(obj: any): void {
    this.formGroup.setValue({
      value: obj,
    });
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    // console.info('registerOnTouched');
  }
  setDisabledState?(isDisabled: boolean): void {
    //console.info('setDisabledState');
  }

  valueChanged(event): void {
    this.onChange(this.formGroup.value.value);
  }

}
