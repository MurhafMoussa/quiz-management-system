export class User {
    private constructor(
        public readonly id: string,
        private _username: string,
        private _email: string,
        private _passwordHash: string,
        public readonly createdAt: Date,
        private _updatedAt: Date,
    ) { }

    get username() {
        return this._username;
    }

    get email() {
        return this._email;
    }

    get updatedAt() {
        return this._updatedAt;
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