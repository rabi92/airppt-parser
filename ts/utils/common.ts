export const cleanupJson = (element) => {
    for (const [key, value] of Object.entries(element)) {
        if (!value) {
            delete element[key];
        }
    }

    return element;
};

export const sanitizeElement= (element) => {
	return element?.map(text => text.replace(/<\s*?script\s*?>|<\s*?\/\s*?script\s*?>/gi, ""));
}
  
