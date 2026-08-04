export class TeacherProfile {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    private _title: string | undefined,
    private _bio: string | undefined,
    private _department: string | undefined,
    private _subjectSpecialties: string[],
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    userId: string;
    title?: string;
    bio?: string;
    department?: string;
    subjectSpecialties?: string[];
  }): TeacherProfile {
    const now = new Date();
    return new TeacherProfile(
      props.id,
      props.userId,
      props.title,
      props.bio,
      props.department,
      props.subjectSpecialties ?? [],
      now,
      now,
    );
  }

  static rehydrate(props: {
    id: string;
    userId: string;
    title?: string;
    bio?: string;
    department?: string;
    subjectSpecialties?: string[];
    createdAt: Date;
    updatedAt: Date;
  }): TeacherProfile {
    return new TeacherProfile(
      props.id,
      props.userId,
      props.title,
      props.bio,
      props.department,
      props.subjectSpecialties ?? [],
      props.createdAt,
      props.updatedAt,
    );
  }

  public get title(): string | undefined {
    return this._title;
  }

  public get bio(): string | undefined {
    return this._bio;
  }

  public get department(): string | undefined {
    return this._department;
  }

  public get subjectSpecialties(): string[] {
    return this._subjectSpecialties;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateProfile(props: {
    title?: string;
    bio?: string;
    department?: string;
    subjectSpecialties?: string[];
  }): void {
    if (props.title !== undefined) {
      this._title = props.title;
    }
    if (props.bio !== undefined) {
      this._bio = props.bio;
    }
    if (props.department !== undefined) {
      this._department = props.department;
    }
    if (props.subjectSpecialties !== undefined) {
      this._subjectSpecialties = props.subjectSpecialties;
    }
    this._updatedAt = new Date();
  }
}
