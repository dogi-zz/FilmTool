import {TableDefinitionItem} from './../../services/table-definition.service';
import {Component, OnInit, OnChanges, Input, forwardRef, SimpleChanges, OnDestroy} from '@angular/core';
import {FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';

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
export class FormSelectSimpleComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  @Input()
  definition: TableDefinitionItem;

  @Input()
  formGroup: FormGroup = new FormGroup({value: new FormControl()});

  options: string[];
  onChange: any;
  sub: Subscription;

  constructor() {}

  ngOnInit(): void {
    this.sub = this.formGroup.valueChanges.subscribe(data => {
      if (this.onChange) {
        this.onChange(data.value);
      }
    });
    this.update();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
  update(): void {
    this.options = this.definition.options;
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

}
