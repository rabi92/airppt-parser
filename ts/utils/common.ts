export const cleanupJson = (element) => {
  for (const [key, value] of Object.entries(element)) {
    if (!value) {
      delete element[key];
    }
  }

  return element;
};

export const sanitizeContent = (contents) => {
  contents?.forEach((content) =>
    content.text?.forEach((text, index) => {
      content.text[index] = text.replace(/<\s*?script\s*?>|<\s*?\/\s*?script\s*?>/gi, "");
    })
  );
};
