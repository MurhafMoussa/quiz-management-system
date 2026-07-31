export class User {

    private constructor(
        public readonly id: string,
        private _username: string,
        private _email: string,
        private _passwordHash: string,
        private _refreshTokenHash: string | undefined,
        public readonly createdAt: Date,
        private _updatedAt: Date,
    ) { }
    static create(params:
        {
            id: string,
            username: string,
            email: string,
            passwordHash: string,
            refreshTokenHash: string | undefined
        }): User {
        const now = new Date();
        return new User(params.id,
            params.username,
            params.email,
            params.passwordHash,
            params.refreshTokenHash,
            now,
            now);
    }
    public static rehydrate(params: {
        id: string;
        username: string;
        email: string;
        passwordHash: string;
        refreshTokenHash: string | undefined;

        createdAt: Date;
        updatedAt: Date;
    }): User {
        return new User(
            params.id,
            params.username,
            params.email,
            params.passwordHash,
            params.refreshTokenHash,
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
    get refreshTokenHash() {
        return this._refreshTokenHash;
    }
    changeUsername(username: string) {
        this._username = username;
        this.touch();
    }

    changePassword(passwordHash: string) {
        this._passwordHash = passwordHash;
        this.touch();
    }
    changeRefreshToken(refreshTokenHash: string) {
        this._refreshTokenHash = refreshTokenHash;
        this.touch();
    }
    clearRefreshToken() {
        this._refreshTokenHash = undefined;
        this.touch();
    }

    private touch() {
        this._updatedAt = new Date();
    }
}