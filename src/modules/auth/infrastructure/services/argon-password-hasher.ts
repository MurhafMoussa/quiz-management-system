import { Injectable } from "@nestjs/common";
import { PasswordHasher } from "../../domain/interfaces/password-hasher";
import * as argon2 from "argon2";
@Injectable()
export class ArgonPasswordHasher implements PasswordHasher {

    hash(password: string): Promise<string> {
        return argon2.hash(password);
    }
    compare(password: string, hash: string): Promise<boolean> {
        return argon2.verify(hash, password);
    }

}