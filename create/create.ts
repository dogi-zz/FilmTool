import * as fs from 'fs';
import * as path from 'path';

type CodeLineDefinition = string | null | CodeLineDefinition[] | {
    expression: string
};

interface CreateDefinitionFile {
    path: string;
    indent: number;
    code: CodeLineDefinition[];
}

export interface CreateDefinition {
    arguments: string[];
    files: CreateDefinitionFile[];
}

export type CreateDefinitions = {
    [name: string]: CreateDefinition,
};

export interface InterfaceConsumer {
    consumeArg: (
        description: string,
        namedArg: string | null,
        validator?: (value: string) => boolean,
        options?: string[]
    ) => Promise<string>;
}


class Tools {

    static dirExists(dir: string): Promise<boolean> {
        return new Promise((res, rej) => {
            fs.stat(dir, (err, stat) => {
                if (err == null) {
                    res(true);
                } else if (err.code === 'ENOENT') {
                    res(false);
                } else {
                    rej(err);
                }
            });
        });
    }

    static dirMakeDir(dir: string): Promise<void> {
        return new Promise((res, rej) => {
            fs.mkdir(dir, {recursive: true}, (err) => {
                if (err) {
                    rej(err);
                } else {
                    res();
                }
            });
        });
    }
}


export class CreatorPerformer {

    private createUtilities: any;

    constructor(
        private allDefinitions: CreateDefinitions,
        private ic: InterfaceConsumer,
    ) {
        this.createUtilities = require('../create.functions.js');
    }

    async perform(): Promise<void> {
        const options = Object.keys(this.allDefinitions);
        const moduleName = await this.ic.consumeArg("Was willst du machen?", null, value => options.includes(value), options);

        const createModule = this.allDefinitions[moduleName];
        console.info("Modul: ", createModule);

        const args: {[name: string]: string} = {};
        for (const argName of createModule.arguments) {
            const argValue = await this.ic.consumeArg(`${argName}?`, argName);
            args[argName] = argValue;
        }
        console.info("Arguments: ", args);

        createModule.files.forEach(file => {
            this.createFile(file, args);
        });
    }

    async createFile(file: CreateDefinitionFile, args: {[name: string]: string;}): Promise<void> {
        const filePath = this.getExpressionResult(file.path, args);
        const fileDir = path.dirname(filePath);
        const dirExists = await Tools.dirExists(fileDir);
        if (!dirExists) {
            await Tools.dirMakeDir(fileDir);
        }
        // TODO: continue hier

        let indent = '';
        let indentCount = file.indent || 2;
        for (let i = 0; i < indentCount; i++) {indent += ' ';}

        let code: string[] = [];
        file.code.forEach(cld => {
            code = code.concat(this.getCodeLine(cld, indent, args));
        });
        console.info(code);
    }



    getCodeLine(codeLineDefinition: CodeLineDefinition, indent: string, args: {[name: string]: string;}): string[] {
        if (codeLineDefinition === null) {
            return [''];
        }
        if (Array.isArray(codeLineDefinition)) {
            let code: string[] = [];
            codeLineDefinition.forEach(cld => {
                code = code.concat(this.getCodeLine(cld, indent, args).map(line => indent + line));
            });
            return code;
        }
        if (typeof (codeLineDefinition) === 'object') {
            if (codeLineDefinition.expression) {
                return [this.getExpressionResult(codeLineDefinition.expression, args)];
            }
            return [];
        }
        return [codeLineDefinition];
    }

    getExpressionResult(pathDefintion: string, args: {[name: string]: string;}): string {
        let result = '';
        let index = 0;
        let match;
        // tslint:disable-next-line: no-conditional-assignment
        while (match = pathDefintion.substr(index).match(/\{(.+?)\}/)) {
            result += pathDefintion.substr(index, match.index) + this.getArgResult(match[1], args);
            index += match.index + match[0].length;
        }
        result += pathDefintion.substr(index);
        return result;
    }

    getArgResult(argDef: string, args: {[name: string]: string;}): string {
        const pipeIdx: number = argDef.lastIndexOf('|');
        if (pipeIdx < 0) {return args[argDef];}
        const funcName = argDef.substr(pipeIdx + 1);
        return this.createUtilities[funcName](this.getArgResult(argDef.substr(0, pipeIdx), args));
    }

}
