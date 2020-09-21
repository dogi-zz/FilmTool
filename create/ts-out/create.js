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
            const moduleName = yield this.ic.consumeArg("Was willst du machen?", null, value => options.includes(value), options);
            const createModule = this.allDefinitions[moduleName];
            console.info("Modul: ", createModule);
            const args = {};
            for (const argName of createModule.arguments) {
                const argValue = yield this.ic.consumeArg(`${argName}?`, argName);
                args[argName] = argValue;
            }
            console.info("Arguments: ", args);
            createModule.files.forEach(file => {
                this.createFile(file, args);
            });
        });
    }
    createFile(file, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = this.getExpressionResult(file.path, args);
            const fileDir = path.dirname(filePath);
            const dirExists = yield Tools.dirExists(fileDir);
            if (!dirExists) {
                yield Tools.dirMakeDir(fileDir);
            }
            // TODO: continue hier
            let indent = '';
            let indentCount = file.indent || 2;
            for (let i = 0; i < indentCount; i++) {
                indent += ' ';
            }
            let code = [];
            file.code.forEach(cld => {
                code = code.concat(this.getCodeLine(cld, indent, args));
            });
            console.info(code);
        });
    }
    getCodeLine(codeLineDefinition, indent, args) {
        if (codeLineDefinition === null) {
            return [''];
        }
        if (Array.isArray(codeLineDefinition)) {
            let code = [];
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
    getExpressionResult(pathDefintion, args) {
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
    getArgResult(argDef, args) {
        const pipeIdx = argDef.lastIndexOf('|');
        if (pipeIdx < 0) {
            return args[argDef];
        }
        const funcName = argDef.substr(pipeIdx + 1);
        return this.createUtilities[funcName](this.getArgResult(argDef.substr(0, pipeIdx), args));
    }
}
exports.CreatorPerformer = CreatorPerformer;
