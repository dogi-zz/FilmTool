"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const create_1 = require("./create");
const readline = require("readline");
// tsc -P ./create/ && node create/ts-out/create-cli.js my_component
const args = process.argv.slice(2);
class MyInterfaceConsumer {
    inputArg(description, validator) {
        return new Promise(res => {
            let result;
            const readlineInterface = readline.createInterface(process.stdin, process.stdout);
            readlineInterface.setPrompt(description + '> ');
            readlineInterface.prompt();
            readlineInterface.on('line', (line) => {
                if (!validator || validator(line)) {
                    result = line;
                    readlineInterface.close();
                    return;
                }
                readlineInterface.prompt();
            }).on('close', () => {
                res(result);
            });
        });
    }
    consumeArg(description, namedArg, validator, options) {
        if (args.length && namedArg) {
            for (let i = 0; i < args.length - 1; i++) {
                if (args[i] === '--' + namedArg) {
                    return Promise.resolve(args.splice(i, 2)[1]);
                }
            }
        }
        if (args.length && !args[0].startsWith('-') && validator(args[0])) {
            return Promise.resolve(args.shift());
        }
        if (options) {
            // tslint:disable-next-line: no-console
            console.info(`Optionen:`);
            options.forEach(option => {
                // tslint:disable-next-line: no-console
                console.info(` - ${option}`);
            });
        }
        return this.inputArg(description, validator);
    }
    consumeStringArg(namedArg) {
        const description = `${namedArg}?`;
        return this.consumeArg(description, namedArg, input => input && input.trim().length > 0);
    }
    consumeBooleanArg(namedArg) {
        const description = `${namedArg} [y/n]?`;
        if (args.length) {
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '-' + namedArg) {
                    args.splice(i, 1);
                    return Promise.resolve(true);
                }
            }
        }
        return this.inputArg(description, input => ['y', 'n'].includes(input)).then((input) => {
            if (input === '') {
                return false;
            }
            return input === 'y';
        });
    }
    consumeNumberArg(namedArg, defaultValue) {
        let description = `${namedArg}?`;
        if (defaultValue !== undefined) {
            description += ` ${defaultValue} `;
        }
        if (args.length) {
            for (let i = 0; i < args.length - 1; i++) {
                if (args[i] === '--' + namedArg) {
                    return Promise.resolve(parseInt(args.splice(i, 2)[1], 10));
                }
            }
        }
        return this.inputArg(description, input => (defaultValue !== undefined && input === '')
            || !isNaN(parseInt(input, 10))).then((input) => {
            if (input === '') {
                return defaultValue;
            }
            return parseInt(input, 10);
        });
    }
}
const interfaceConsumer = new MyInterfaceConsumer();
const allDefinitions = JSON.parse(fs.readFileSync('create/create.json', 'UTF-8'));
new create_1.CreatorPerformer(allDefinitions, interfaceConsumer).perform();
