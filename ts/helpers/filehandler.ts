import { promises as fs } from "fs";
import * as xml2js from "xml2js-es6-promise";

export default class FileHandler {
    public static async parseContentFromFile(fileName) {
        const presentationXML = await fs.readFile(fileName, "utf8");
        return xml2js(presentationXML, {
            trim: true,
            preserveChildrenOrderForMixedContent: true
        });
    }
}
