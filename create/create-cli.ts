import * as fs from 'fs';
import {CreateDefinitions, CreateInterface, CreatorPerformer} from './create';
import * as  readline from 'readline';

// tsc -P ./create/ && node create/ts-out/create-cli.js my_component

const args = process.argv.slice(2);

class CliCreateInterface implements CreateInterface {


    inputArg(
        description: string,
        validator?: (value: string) => boolean
    ): Promise<string> {
        return new Promise<string>(res => {
            let result: string;
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


    consumeArg(
        description: string,
        namedArg: string | null,
        validator?: (value: string) => boolean,
        options?: string[]
    ): Promise<string> {

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


    consumeStringArg(namedArg: string): Promise<string> {
        const description = `${namedArg}?`;
        return this.consumeArg(description, namedArg, input => input && input.trim().length > 0);
    }

    consumeBooleanArg(namedArg: string): Promise<boolean> {
        const description = `${namedArg} [y/n]?`;

        if (args.length) {
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '-' + namedArg) {
                    args.splice(i, 1);
                    return Promise.resolve(true);
                }
            }
        }
        return this.inputArg(description, input =>
            ['y', 'n'].includes(input)
        ).then((input: string) => {
            if (input === '') {return false;}
            return input === 'y';
        });
    }

    consumeNumberArg(namedArg: string, defaultValue: number): Promise<number> {
        let description = `${namedArg}?`;
        if (defaultValue !== undefined) {description += ` ${defaultValue} `;}

        if (args.length) {
            for (let i = 0; i < args.length - 1; i++) {
                if (args[i] === '--' + namedArg) {
                    return Promise.resolve(parseInt(args.splice(i, 2)[1], 10));
                }
            }
        }

        return this.inputArg(description, input =>
            (defaultValue !== undefined && input === '')
            || !isNaN(parseInt(input, 10))
        ).then((input: string) => {
            if (input === '') {return defaultValue;}
            return parseInt(input, 10);
        });
    }
}
const interfaceConsumer = new CliCreateInterface();

const allDefinitions: CreateDefinitions = JSON.parse(fs.readFileSync('create/create.json', 'UTF-8'));

new CreatorPerformer(allDefinitions, interfaceConsumer).perform();

