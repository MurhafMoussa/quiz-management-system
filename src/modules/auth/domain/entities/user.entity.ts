export class User {

    private constructor(
        public readonly id: string,
        private _username: string,
        private _email: string,
        private _passwordHash: string,
        public readonly createdAt: Date,
        private _updatedAt: Date,
    ) { }
    static create(params:
        {
            id: string,
            username: string,
            email: string,
            passwordHash: string
        }): User {
        const now = new Date();
        return new User(params.id,
            params.username,
            params.email,
            params.passwordHash,
            now,
            now);
    }
    public static rehydrate(params: {
        id: string;
        username: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }): User {
        return new User(
            params.id,
            params.username,
            params.email,
            params.passwordHash,
            params.createdAt,
            params.updatedAt,
        );
    }
    get username() {
        return this._username;
    }

    get email() {
        return this._email;
    }

    get updatedAt() {
        return this._updatedAt;
    }
    get passwordHash() {
        return this._passwordHash;
    }
    changeUsername(username: string) {

        this._username = username;
        this.touch();
    }

    changePassword(passwordHash: string) {
        this._passwordHash = passwordHash;
        this.touch();
    }

    private touch() {
        this._updatedAt = new Date();
    }
}