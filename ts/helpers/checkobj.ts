/**
 *
 * Important function that allows for undefined objects that maybe nested deeper and missing
 */

import * as format from "string-template";

export function getValueAtPath(obj: any, path: string): any {
    try {
        return eval(format("obj{0}", path));
    } catch (e) {
        return undefined;
    }
}

export function checkPath(obj: any, path: string): boolean {
    if (getValueAtPath(obj, path) === undefined) {
        return false;
    } else {
        return true;
    }
}
