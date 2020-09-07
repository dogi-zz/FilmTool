import {TableDefinitionItem} from './../../../services/table-definition.service';
import {Component, OnInit, OnChanges, Input, forwardRef, SimpleChanges} from '@angular/core';
import {SelectItem} from 'primeng/api';
import {FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup} from '@angular/forms';

export const CHECKBOX_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FormSelectSimpleComponent),
  multi: true,
};

@Component({
  selector: 'app-form-select-simple',
  templateUrl: './form-select-simple.component.html',
  styleUrls: ['./form-select-simple.component.scss'],
  providers: [CHECKBOX_VALUE_ACCESSOR],
})
export class FormSelectSimpleComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input()
  definition: TableDefinitionItem;

  @Input()
  formGroup: FormGroup = new FormGroup({value: new FormControl()});

  options: SelectItem[];
  onChange: any;

  constructor() {}

  ngOnInit(): void {
    this.update();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }
  update(): void {
    this.options = [
      {label: 'nix', value: null},
      ...this.definition.options.map(option => ({
        label: option,
        value: option,
      }))
    ];
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
