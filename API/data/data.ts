import { User } from "../../Types/userTypes";

export type RelationMap<T> = {
    [K in keyof T]?: boolean | (T[K] extends Array<infer U> ? RelationMap<U> : RelationMap<T[K]>);
};

export async function MapRMapToPMap<R, P>(
    relation: RelationMap<R>
  ): Promise<P> {
    const include = {} as P;

    // map relation to the include, include all rescursive relations in RelationMap
    for (const key in relation) {
      if (relation[key] === true) {
        (include as any)[key] = true;
      }
      // if the value is an object, recursively map it
      else if (typeof relation[key] === "object") {
        (include as any)[key] = {
          include: await MapRMapToPMap(relation[key] as RelationMap<R>)
        };
      }
      // if the value is an array, map it as well
      else if (Array.isArray(relation[key])) {
        (include as any)[key] = {
          include: await MapRMapToPMap(relation[key][0] as RelationMap<R>)
        };
      }
    }
    return include;
  }

export class UserDatapacks {
    public static readonly ALL_USER_DATA: RelationMap<User> = {
        servers: {
            channels: {
                messages: {
                    author: true
                }
            }
        },
        roles: true
     

    }
    public static readonly USER_PUBLIC_DATA: RelationMap<User> = {}
}

