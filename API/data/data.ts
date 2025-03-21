export type RelationMap<T> = {
    [K in keyof T]?: boolean | (T[K] extends Array<infer U> ? RelationMap<U>[] : RelationMap<T[K]>);
};