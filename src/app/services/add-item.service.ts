import {TableDefinitionService, TableDefinitionItem} from './table-definition.service';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {Injectable} from '@angular/core';

export abstract class AddItemComponent {
    public abstract initEdit(tableName: string, definitions: TableDefinitionItem[]): void;
    public abstract setValue(value: any): any;
    public abstract closeEdit(): Promise<any>;
}

@Injectable({
    providedIn: 'root'
})
export class AddItemService {


    //public addItemData: BehaviorSubject<[string, any, () => void]> = new BehaviorSubject<[string, any, () => void]>([null, null, () => {}]);

    public addList: string[] = [];
    //public addCallBacks: ((value: any) => void)[] = [];
    public itemStack: [any, string, (v: any) => void][] = [];

    //public callBack: () => void;

    modalFormRef: DynamicDialogRef;
    modalFormInstance: AddItemComponent;
    modalFormComponentType: any;

    res: (value?: any) => void;


    constructor(
        public dialogService: DialogService,
        private tableDefinitionService: TableDefinitionService,
    ) {
    }

    public addItemForTable(tableName: string): Promise<any> {
        if (this.modalFormRef) {
            this.modalFormRef.close();
        }
        //this.addItemData.next([tableName, null, () => {}]);

        console.info(this.modalFormComponentType);
        this.modalFormRef = this.dialogService.open(this.modalFormComponentType, {
            header: 'Element Anlegen',
            width: '70%',
            data: {
                modalWindowOpen: (instance: AddItemComponent) => {
                    this.modalFormInstance = instance;
                    this.openAddForm();
                }
            }
        });
        this.modalFormRef.onDestroy.subscribe(() => {
            this.addList = [];
            this.itemStack = [];
        });

        return new Promise(res => {
            this.addList = [tableName];
            this.res = res;
            // this.addCallBacks = [(value: any) => {
            //     this.modalFormRef.close();
            //     this.modalFormRef = null;
            //     res(value);
            // }];
        });
    }

    private async openAddForm(): Promise<void> {
        const tableName = this.addList[this.addList.length - 1];
        const definitions = await this.tableDefinitionService.getDefinitionItems(tableName);
        this.modalFormInstance.initEdit(tableName, definitions);
    }

    public addSubItem(tableName: string, fieldName: string): Promise<any> {
        return new Promise(async res => {
            const itemForStack = await this.modalFormInstance.closeEdit();
            this.itemStack.push([itemForStack, fieldName, (v) => {res(v);}]);
            this.addList.push(tableName);
            this.openAddForm();
        });
    }

    async afterItemAdd(value: any): Promise<void> {
        if (this.itemStack.length) {
            const tableName = this.addList.pop();
            const [lastItem, fieldName, continueCallback] = this.itemStack.pop();
            await this.openAddForm();
            lastItem[fieldName] = value['id'];
            continueCallback(value);
            this.modalFormInstance.setValue(lastItem);
        } else {
            if (this.modalFormRef) {
                this.modalFormRef.close();
                this.res(value);
            }
        }
    }
}
