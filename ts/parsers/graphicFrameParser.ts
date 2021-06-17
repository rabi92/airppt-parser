//Graphic frame node includes tables, charts and diagrams

import { getAttributeByPath } from "../helpers/attributesHandler";

export default class GraphicFrameParser {
    public static processGraphicFrameNodes = (graphicFrames) => {
        const result = [];
        for(const frame of graphicFrames) {
            const graphicTypeUri = getAttributeByPath([frame], ["a:graphic", "a:graphicData", "$"]).uri;
            switch (graphicTypeUri) {
                case "http://schemas.openxmlformats.org/drawingml/2006/table":
                    result.push(frame);
                    break;
                case "http://schemas.openxmlformats.org/drawingml/2006/chart":
                    break;
                case "http://schemas.openxmlformats.org/drawingml/2006/diagram":
                    break;
                default:
            }
        }

        return result;
    }
}
