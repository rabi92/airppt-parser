//handle all zip file actions here
import { promises as fs } from 'fs';
import * as xml2js from "xml2js-es6-promise";

export default class FileHandler {
    public static async parseSlideAttributes(fileName) {
        console.log(fileName)
        const presentationSlide = await fs.readFile(fileName, 'utf8');
        console.log(presentationSlide)
        const parsedPresentationSlide = await xml2js(presentationSlide, {
            trim: true,
            preserveChildrenOrderForMixedContent: true
        });

        return parsedPresentationSlide;
    }
}
