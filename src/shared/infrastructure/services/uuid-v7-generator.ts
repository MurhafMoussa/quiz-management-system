import { Injectable } from "@nestjs/common";
import { IdGenerator } from "src/shared/domain/interfaces/id-generator";
import { v7 as uuidv7 } from 'uuid';
@Injectable()
 export class UuidV7Generator implements IdGenerator {
    generate(): string {
        return uuidv7();
    } 

}