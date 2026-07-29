import * as fs from 'fs';
import * as path from 'path';
import { I18nPath } from "src/generated/i18n.generated";

// Inside catch():
const targetPath = path.join(process.cwd(), 'dist/locales/en/auth.json');
const srcPath = path.join(process.cwd(), 'src/locales/en/auth.json');

console.log('--- DEBUG I18N PATHS ---');
console.log('Dist path exists?', fs.existsSync(targetPath));
console.log('Src path exists?', fs.existsSync(srcPath));
console.log('__dirname resolution:', path.join(__dirname, '../../locales/'));
export abstract class DomainException extends Error {
    constructor(
        public readonly key: I18nPath,
        public readonly args?: Record<string, any>,
    ) {
        super(key);
    }
}