import {CodeModel} from '@ngstack/code-editor';
import * as fs from 'fs';
import * as path from 'path';

interface CreateDefinitionFile {
    path: string;
    indent: number;
    code: CodeLineDefinition[];
}


export type CodeLineDefinition = string | null | CodeLineDefinition[] | {
    expression: 'argument',
    line: string,
} | {
    expression: 'if',
    if: string,
    then: CodeLineDefinition[],
    else: CodeLineDefinition[],
} | {
    expression: '//',
    '//': string,
};


export interface CreateArgumentDefinitionString {
    name: string;
    type: 'string';
}
export interface CreateArgumentDefinitionBoolean {
    name: string;
    type: 'boolean';
}
export interface CreateArgumentDefinitionNumber {
    name: string;
    type: 'number';
    default?: number;
}
export type CreateArgumentDefinition =
    CreateArgumentDefinitionString
    | CreateArgumentDefinitionBoolean
    | CreateArgumentDefinitionNumber;


export interface CreateDefinition {
    arguments: CreateArgumentDefinition[];
    files: CreateDefinitionFile[];
}


export type CreateDefinitions = {
    [name: string]: CreateDefinition,
};



export interface CreateInterface {
    consumeArg: (
        description: string,
        namedArg: string | null,
        validator?: (value: string) => boolean,
        options?: string[]
    ) => Promise<string>;

    consumeStringArg: (namedArg: string) => Promise<string>;

    consumeBooleanArg: (namedArg: string) => Promise<boolean>;

    consumeNumberArg: (namedArg: string, defaultValue: number) => Promise<number>;

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
        private ic: CreateInterface,
    ) {
        this.createUtilities = require('../create.functions.js');
    }

    async perform(): Promise<void> {
        const options = Object.keys(this.allDefinitions);
        const moduleName = await this.ic.consumeArg('Was willst du machen?', null, value => options.includes(value), options);

        const createModule = this.allDefinitions[moduleName];

        const args: {[name: string]: any} = {};
        for (const argDef of createModule.arguments) {
            if (argDef.type === 'string') {
                args[argDef.name] = await this.ic.consumeStringArg(argDef.name);
            }
            if (argDef.type === 'boolean') {
                args[argDef.name] = await this.ic.consumeBooleanArg(argDef.name);
            }
            if (argDef.type === 'number') {
                args[argDef.name] = await this.ic.consumeNumberArg(argDef.name, argDef.default);
            }
        }

        createModule.files.forEach(file => {
            this.createFile(file, args);
        });
    }

    async createFile(file: CreateDefinitionFile, args: {[name: string]: any}): Promise<void> {
        const filePath = this.getExpressionResult(file.path, args);
        args._filePath_ = filePath;
        const fileDir = path.dirname(filePath);
        const dirExists = await Tools.dirExists(fileDir);
        if (!dirExists) {
            await Tools.dirMakeDir(fileDir);
        }
        // TODO: continue hier

        let indent = '';
        const indentCount = file.indent || 2;
        for (let i = 0; i < indentCount; i++) {indent += ' ';}

        const code: string[] = this.getCodeLines(file.code, indent, args);
        console.info(code);
    }

    getCodeLines(codeLineDefinitions: CodeLineDefinition[], indent: string, args: {[name: string]: any}): string[] {
        let code: string[] = [];
        codeLineDefinitions.forEach(cld => {
            code = code.concat(this.getCodeLine(cld, indent, args));
        });
        return code;
    }


    getCodeLine(codeLineDefinition: CodeLineDefinition, indent: string, args: {[name: string]: any}): string[] {
        if (codeLineDefinition === null) {
            return [''];
        }
        if (Array.isArray(codeLineDefinition)) {
            let code: string[] = [];
            codeLineDefinition.forEach(cld => {
                code = code.concat(this.getCodeLine(cld, indent, args).map(line => (line.length ? indent : '') + line));
            });
            return code;
        }
        if (typeof (codeLineDefinition) === 'object') {
            if (codeLineDefinition.expression === 'argument') {
                return [this.getExpressionResult(codeLineDefinition.line, args)];
            }
            if (codeLineDefinition.expression === 'if') {
                if (args[codeLineDefinition.if]) {
                    return this.getCodeLines(codeLineDefinition.then, indent, args);
                } else {
                    if (codeLineDefinition.else) {
                        return this.getCodeLines(codeLineDefinition.else, indent, args);
                    }
                }
            }
            return [];
        }
        return [codeLineDefinition];
    }

    getExpressionResult(pathDefintion: string, args: {[name: string]: any}): string {
        const tokens: [string, boolean][] = [];
        let token: [string, boolean] = ['', false];
        for (let i = 0; i < pathDefintion.length; i++) {
            if (pathDefintion[i] === '\\') {
                token[0] += pathDefintion[i + 1];
                i++;
                continue;
            }
            if (pathDefintion[i] === '{') {
                if (token[0].length) {tokens.push(token);}
                token = ['', true];
            }
            token[0] += pathDefintion[i];
            if (pathDefintion[i] === '}') {
                if (token.length) {tokens.push(token);}
                token = ['', false];
            }
        }
        if (token[0].length) {
            token[1] = false;
            tokens.push(token);
        }
        const result = tokens.map(t => t[1] ? this.getArgResult(t[0].substr(1, t[0].length - 2), args) : t[0]);
        return result.join('');
    }

    getArgResult(argDef: string, args: {[name: string]: any}): string {
        const pipeIdx: number = argDef.lastIndexOf('|');
        if (pipeIdx < 0) {
            if (argDef.startsWith('\'') && argDef.endsWith('\'')) {
                return argDef.substr(1, argDef.length - 2);
            }
            return args[argDef];
        }
        const funcName = argDef.substr(pipeIdx + 1);
        return this.createUtilities[funcName](this.getArgResult(argDef.substr(0, pipeIdx), args), args);
    }

}
