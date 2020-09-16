import {Injectable} from '@angular/core';
import {DialogService} from 'primeng/dynamicdialog';
import {DataService} from './data.service';
import {TableDefinition, TableDefinitionService} from './table-definition.service';

export abstract class EditComponent {
    public abstract open(): void;
    public abstract close(): void;

    public abstract edit(
        tableName: string,
        definition: TableDefinition,
        item: any,
        isMainItem: boolean,
        done: (data: any) => void,
        cancel: () => void,
    ): void;
    public abstract getValue(): any;
}

export interface ItemStackInfo {
    tableName: string;
    item: any;
    definition: TableDefinition;
    callBack: (item: any) => void;
}

@Injectable({
    providedIn: 'root'
})
export class EditDialogService {

    private itemStack: ItemStackInfo[] = [];
    public component: EditComponent;

    constructor(
        public dialogService: DialogService,
        private tableDefinitionService: TableDefinitionService,
        private dataService: DataService,
    ) {
    }


    public addNewItem(tableName: string): Promise<any> {
        return new Promise(res => {
            this.tableDefinitionService.getDefinition(tableName).then(definition => {
                if (this.itemStack.length) {
                    this.itemStack[this.itemStack.length - 1].item = this.component.getValue();
                }
                const editInfo: ItemStackInfo = {
                    tableName,
                    definition,
                    item: {},
                    callBack: async (newItem: any) => {
                        this.itemStack.pop();
                        res(newItem);
                        if (this.itemStack.length) {
                            const tail = this.itemStack[this.itemStack.length - 1];
                            this.component.edit(
                                tail.tableName,
                                tail.definition,
                                tail.item,
                                tail === this.itemStack[0],
                                tail.callBack,
                                () => {
                                    this.itemStack = [];
                                }
                            );
                        } else {
                            this.component.close();
                        }
                    },
                };
                this.itemStack.push(editInfo);

                if (editInfo === this.itemStack[0]) {
                    this.component.open();
                }
                this.component.edit(
                    editInfo.tableName,
                    editInfo.definition,
                    editInfo.item,
                    editInfo === this.itemStack[0],
                    editInfo.callBack,
                    () => {
                        this.itemStack = [];
                    }
                );

            });
        });
    }

}
