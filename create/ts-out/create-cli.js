"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const create_1 = require("./create");
const readline = require("readline");
// tsc -P ./create/ && node create/ts-out/create-cli.js my_component
const args = process.argv.slice(2);
const interfaceConsumer = {
    consumeArg: (description, namedArg, validator, options) => {
        return new Promise(res => {
            if (options) {
                // tslint:disable-next-line: no-console
                console.info(`Optionen:`);
                options.forEach(option => {
                    // tslint:disable-next-line: no-console
                    console.info(` - ${option}`);
                });
            }
            let result;
            if (args.length && !args[0].startsWith('-') && validator(args[0])) {
                res(args.shift());
                return;
            }
            if (args.length && namedArg) {
                for (let i = 0; i < args.length - 1; i++) {
                    if (args[i] === '--' + namedArg) {
                        res(args.splice(i, 2)[1]);
                        return;
                    }
                }
            }
            const readlineInterface = readline.createInterface(process.stdin, process.stdout);
            readlineInterface.setPrompt(description + '> ');
            readlineInterface.prompt();
            readlineInterface.on('line', (line) => {
                if (line && line.trim()) {
                    if (!validator || validator(line)) {
                        result = line;
                        readlineInterface.close();
                        return;
                    }
                }
                readlineInterface.prompt();
            }).on('close', () => {
                res(result);
            });
        });
    }
};
const allDefinitions = JSON.parse(fs.readFileSync('create/create.json', 'UTF-8'));
new create_1.CreatorPerformer(allDefinitions, interfaceConsumer).perform();
