import { AggregateRoot } from 'src/shared/domain/entities/aggrigate-root';
import { UserRegisteredEvent } from '../events/user-registered.event';

export class User extends AggregateRoot {
  private constructor(
    public readonly id: string,
    private _firstName: string,
    private _lastName: string,
    private _email: string,
    private _passwordHash: string,
    private _refreshTokenHash: string | undefined,
    private _isVerified: boolean,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }
  static create(params: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    refreshTokenHash: string | undefined;
    isVerified?: boolean;
  }): User {
    const now = new Date();
    const user = new User(
      params.id,
      params.firstName,
      params.lastName,
      params.email,
      params.passwordHash,
      params.refreshTokenHash,
      params.isVerified ?? false,
      now,
      now,
    );
    user.recordDomainEvent(new UserRegisteredEvent(params.id, params.email));

    return user;
  }
  public static rehydrate(params: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    refreshTokenHash: string | undefined;
    isVerified?: boolean;

    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      params.id,
      params.firstName,
      params.lastName,
      params.email,
      params.passwordHash,
      params.refreshTokenHash,
      params.isVerified ?? false,
      params.createdAt,
      params.updatedAt,
    );
  }
  get firstName() {
    return this._firstName;
  }

  get lastName() {
    return this._lastName;
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
  get isVerified() {
    return this._isVerified;
  }
  changeFirstName(firstName: string) {
    this._firstName = firstName;
    this.touch();
  }
  changeLastName(lastName: string) {
    this._lastName = lastName;
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
  markAsVerified() {
    this._isVerified = true;
    this.touch();
  }

  private touch() {
    this._updatedAt = new Date();
  }
}
