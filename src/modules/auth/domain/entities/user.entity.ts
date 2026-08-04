import { AggregateRoot } from 'src/shared/domain/entities/aggrigate-root';
import { Role } from 'src/shared/domain/enums/role.enum';
import { UserRegisteredEvent } from '../events/user-registered.event';

export class User extends AggregateRoot {
  public profile?: any;

  private constructor(
    public readonly id: string,
    private _firstName: string,
    private _lastName: string,
    private _email: string,
    private _passwordHash: string,
    private _refreshTokenHash: string | undefined,
    private _isVerified: boolean,
    private _role: Role,
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
    role?: Role;
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
      params.role ?? Role.STUDENT,
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
    role?: Role;

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
      params.role ?? Role.STUDENT,
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
  get role() {
    return this._role;
  }
  changeFirstName(firstName: string) {
    this._firstName = firstName;
    this.touch();
  }
  changeLastName(lastName: string) {
    this._lastName = lastName;
    this.touch();
  }
  changeRole(role: Role) {
    this._role = role;
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
