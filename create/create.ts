
import * as fs from 'fs';

interface CreateDefinitionFile {
    path: string;
}


interface CreateDefinition {
    arguments: string[];
    files: CreateDefinitionFile[];
}

type CreateDefinitions = {
    [name: string]: CreateDefinition,
}


console.info(process.argv);

const allDefinitions: CreateDefinitions = JSON.parse(fs.readFileSync('create/create.json', 'UTF-8'));

console.info(allDefinitions);