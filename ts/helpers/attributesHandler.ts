
export const getAttributeByPath = (slideAttributes, path) => {

    if(!Array.isArray(path)){
        throw Error("Invalid path");
    }

    if(slideAttributes === undefined) {
        return undefined;
    }

    for(const node of path){
        slideAttributes = slideAttributes[0][node];
        if (slideAttributes === undefined) {
            return [];
        }
    }

    return slideAttributes;
}

export const cleanupJson = (element) => {
    for (const [key, value] of Object.entries(element)) {
        if(!value) {
            delete element[key];
        }
    }
    return element;
}
