"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorPerformer = void 0;
const fs = require("fs");
const path = require("path");
class Tools {
    static dirExists(dir) {
        return new Promise((res, rej) => {
            fs.stat(dir, (err, stat) => {
                if (err == null) {
                    res(true);
                }
                else if (err.code === 'ENOENT') {
                    res(false);
                }
                else {
                    rej(err);
                }
            });
        });
    }
    static dirMakeDir(dir) {
        return new Promise((res, rej) => {
            fs.mkdir(dir, { recursive: true }, (err) => {
                if (err) {
                    rej(err);
                }
                else {
                    res();
                }
            });
        });
    }
}
class CreatorPerformer {
    constructor(allDefinitions, ic) {
        this.allDefinitions = allDefinitions;
        this.ic = ic;
        this.createUtilities = require('../create.functions.js');
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.keys(this.allDefinitions);
            const moduleName = yield this.ic.consumeArg('Was willst du machen?', null, value => options.includes(value), options);
            const createModule = this.allDefinitions[moduleName];
            const args = {};
            for (const argDef of createModule.arguments) {
                if (argDef.type === 'string') {
                    args[argDef.name] = yield this.ic.consumeStringArg(argDef.name);
                }
                if (argDef.type === 'boolean') {
                    args[argDef.name] = yield this.ic.consumeBooleanArg(argDef.name);
                }
                if (argDef.type === 'number') {
                    args[argDef.name] = yield this.ic.consumeNumberArg(argDef.name, argDef.default);
                }
            }
            createModule.files.forEach(file => {
                this.createFile(file, args);
            });
        });
    }
    createFile(file, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = this.getExpressionResult(file.path, args);
            args._filePath_ = filePath;
            const fileDir = path.dirname(filePath);
            const dirExists = yield Tools.dirExists(fileDir);
            if (!dirExists) {
                yield Tools.dirMakeDir(fileDir);
            }
            // TODO: continue hier
            let indent = '';
            const indentCount = file.indent || 2;
            for (let i = 0; i < indentCount; i++) {
                indent += ' ';
            }
            const code = this.getCodeLines(file.code, indent, args);
            console.info(code);
        });
    }
    getCodeLines(codeLineDefinitions, indent, args) {
        let code = [];
        codeLineDefinitions.forEach(cld => {
            code = code.concat(this.getCodeLine(cld, indent, args));
        });
        return code;
    }
    getCodeLine(codeLineDefinition, indent, args) {
        if (codeLineDefinition === null) {
            return [''];
        }
        if (Array.isArray(codeLineDefinition)) {
            let code = [];
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
                }
                else {
                    if (codeLineDefinition.else) {
                        return this.getCodeLines(codeLineDefinition.else, indent, args);
                    }
                }
            }
            return [];
        }
        return [codeLineDefinition];
    }
    getExpressionResult(pathDefintion, args) {
        const tokens = [];
        let token = ['', false];
        for (let i = 0; i < pathDefintion.length; i++) {
            if (pathDefintion[i] === '\\') {
                token[0] += pathDefintion[i + 1];
                i++;
                continue;
            }
            if (pathDefintion[i] === '{') {
                if (token[0].length) {
                    tokens.push(token);
                }
                token = ['', true];
            }
            token[0] += pathDefintion[i];
            if (pathDefintion[i] === '}') {
                if (token.length) {
                    tokens.push(token);
                }
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
    getArgResult(argDef, args) {
        const pipeIdx = argDef.lastIndexOf('|');
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
exports.CreatorPerformer = CreatorPerformer;
