export class StudentProfile {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly studentIdCode: string,
    private _gradeLevel: string | undefined,
    private _interests: string[],
    private _major: string | undefined,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    userId: string;
    studentIdCode: string;
    gradeLevel?: string;
    interests?: string[];
    major?: string;
  }): StudentProfile {
    const now = new Date();
    return new StudentProfile(
      props.id,
      props.userId,
      props.studentIdCode,
      props.gradeLevel,
      props.interests ?? [],
      props.major,
      now,
      now,
    );
  }

  static rehydrate(props: {
    id: string;
    userId: string;
    studentIdCode: string;
    gradeLevel?: string;
    interests?: string[];
    major?: string;
    createdAt: Date;
    updatedAt: Date;
  }): StudentProfile {
    return new StudentProfile(
      props.id,
      props.userId,
      props.studentIdCode,
      props.gradeLevel,
      props.interests ?? [],
      props.major,
      props.createdAt,
      props.updatedAt,
    );
  }

  public get gradeLevel(): string | undefined {
    return this._gradeLevel;
  }

  public get interests(): string[] {
    return this._interests;
  }

  public get major(): string | undefined {
    return this._major;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateProfile(props: {
    gradeLevel?: string;
    interests?: string[];
    major?: string;
  }): void {
    if (props.gradeLevel !== undefined) {
      this._gradeLevel = props.gradeLevel;
    }
    if (props.interests !== undefined) {
      this._interests = props.interests;
    }
    if (props.major !== undefined) {
      this._major = props.major;
    }
    this._updatedAt = new Date();
  }
}
