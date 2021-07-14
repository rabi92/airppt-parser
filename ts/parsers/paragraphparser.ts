import { checkPath, getValueAtPath } from "../helpers";
import { ColorParser } from "./";

import {
    PowerpointElement,
    TextAlignment,
    FontAttributes,
    Paragraph,
    Content,
    List,
    ListType
} from "airppt-models-plus/pptelement";

/**
 * Parse the paragraph elements
 */
export default class ParagraphParser {
    public static isList(paragraph): boolean {
        return (
            checkPath(paragraph, '["a:pPr"][0]["a:buAutoNum"]') ||
            checkPath(paragraph, '["a:pPr"][0]["a:buChar"]')
        );
    }

    public static getParagraph(paragraph): Paragraph {
        const textElements = paragraph["a:r"] || [];
        const content = textElements.map((txtElement) => {
            return {
                text: txtElement["a:t"] || "",
                textCharacterProperties: this.determineTextProperties(
                    getValueAtPath(txtElement, '["a:rPr"][0]')
                )
            };
        });

        return {
            content: content,
            paragraphProperties: this.determineParagraphProperties(paragraph)
        };
    }

    public static getListlevel(paragraph): number {
        const level = getValueAtPath(paragraph, '["a:pPr"][0]["$"]["lvl"]');

        return level ? parseInt(level) : 0;
    }

    public static getListType(paragraph): ListType {
        if (checkPath(paragraph, '["a:pPr"][0]["a:buAutoNum"]')) {
            return ListType.Ordered;
        }

        return ListType.UnOrdered;
    }

    public static restructureList(list: List): List {
        for (let i = 0; i < list.listItems.length - 1; i++) {
            if (list.listItems[i + 1].list) {
                list.listItems[i]["list"] = this.restructureList(list.listItems[i + 1].list);
                list.listItems.splice(i + 1, 1);
            }
        }
        return list;
    }

    public static extractParagraphElements(paragraphs: any[]): PowerpointElement["paragraph"] {
        if (!paragraphs || paragraphs.length === 0) {
            return null;
        }

        const paras = [];
        const stack = [];
        const paragraph: Paragraph = {
            list: {
                listType: ListType.Ordered,
                listItems: []
            }
        };
        let currentParagraph = paragraph;
        let currentLevel = -1;

        for (const p of paragraphs) {
            if (this.isList(p)) {
                const listLevel = this.getListlevel(p);

                //if its the first of the list kind
                if (currentLevel === -1) {
                    currentLevel = 0;
                    currentParagraph.list.listType = this.getListType(p);
                    currentParagraph.list.listItems.push(this.getParagraph(p));
                    stack.push(currentParagraph);
                }
                //if the level is same keep pushing the list items in the same array
                else if (listLevel === currentLevel) {
                    currentParagraph.list.listItems.push(this.getParagraph(p));
                } else if (listLevel > currentLevel) {
                    //edge case to handle if multiple levels are jumped ahead
                    //create empty paragraphs/lists to maintain hierarchy and fill in the level gaps
                    while (currentLevel < listLevel - 1) {
                        const emptyPara: Paragraph = {
                            list: {
                                listType: ListType.None,
                                listItems: []
                            }
                        };
                        currentParagraph.list.listItems.push(emptyPara);
                        currentParagraph = emptyPara;
                        //pushing it in the stack to keep track of the parents
                        stack.push(emptyPara);
                        currentLevel++;
                    }
                    //if there is another hierarchy starting create a new list for it
                    const newPara: Paragraph = {
                        list: {
                            listType: this.getListType(p),
                            listItems: [this.getParagraph(p)]
                        }
                    };
                    currentParagraph.list.listItems.push(newPara);
                    currentParagraph = newPara;
                    //pushing it in the stack to keep track of the parents
                    stack.push(newPara);
                    currentLevel++;
                } else {
                    //if we find the list level lower than current level
                    //keep going back in stack until the same level parent found
                    while (currentLevel !== listLevel) {
                        stack.pop();
                        currentLevel--;
                    }
                    //and push the new item as a sibling
                    currentParagraph = stack[stack.length - 1];
                    currentParagraph.list.listItems.push(this.getParagraph(p));
                }
            } else {
                //if the paragraph was not a list item
                //check if we previously had the list items then push the list in paragraphs
                if (paragraph.list.listItems.length > 0) {
                    paragraph.list = this.restructureList(paragraph.list);
                    paras.push(paragraph);
                    paragraph.list.listItems = [];
                }
                paras.push(this.getParagraph(p));
            }
        }
        //true if there were only list items in the text box, push them
        if (paragraph.list.listItems.length > 0) {
            paragraph.list = this.restructureList(paragraph.list);
            paras.push(paragraph);
        }

        return paras;
    }

    /**a:rPr */
    public static determineTextProperties(textProperties): Content["textCharacterProperties"] {
        if (!textProperties) {
            return null;
        }

        const textPropertiesElement: Content["textCharacterProperties"] = {
            size: getValueAtPath(textProperties, '["$"].sz') || 1200,
            fontAttributes: this.determineFontAttributes(textProperties["$"]),
            font: getValueAtPath(textProperties, '["a:latin"][0]["$"]["typeface"]') || "Helvetica",
            fillColor: ColorParser.getTextColors(textProperties) || "000000"
        };

        return textPropertiesElement;
    }

    /** Parse for italics, bold, underline & strike through*/
    public static determineFontAttributes(attributesList): FontAttributes[] {
        const attributesArray: FontAttributes[] = [];
        if (!attributesList) {
            return null;
        }
        Object.keys(attributesList).forEach((element) => {
            if (element === FontAttributes.Bold && attributesList[element] == 1) {
                attributesArray.push(FontAttributes.Bold);
            }
            if (element === FontAttributes.Italics && attributesList[element] == 1) {
                attributesArray.push(FontAttributes.Italics);
            }
            if (element === FontAttributes.Underline && attributesList[element] != "none") {
                attributesArray.push(FontAttributes.Underline);
            }
            if (element === FontAttributes.StrikeThrough && attributesList[element] != "noStrike") {
                attributesArray.push(FontAttributes.StrikeThrough);
            }
        });
        return attributesArray;
    }

    /**a:pPr */
    public static determineParagraphProperties(
        paragraphProperties
    ): Paragraph["paragraphProperties"] {
        if (!paragraphProperties) {
            return null;
        }

        let alignment: TextAlignment = TextAlignment.Left;

        const alignProps = getValueAtPath(paragraphProperties, '["a:pPr"][0]["$"]["algn"]');

        if (alignProps) {
            switch (alignProps) {
                case "ctr":
                    alignment = TextAlignment.Center;
                    break;
                case "l":
                    alignment = TextAlignment.Left;
                    break;
                case "r":
                    alignment = TextAlignment.Right;
                    break;
                case "j":
                    alignment = TextAlignment.Justified;
                    break;
            }
        }
        const paragraphPropertiesElement: Paragraph["paragraphProperties"] = {
            alignment
        };

        return paragraphPropertiesElement;
    }
}
