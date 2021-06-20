//Graphic frame node includes tables, charts and diagrams

import { getAttributeByPath } from "../helpers/attributesHandler";

export default class GraphicFrameParser {
  public static processGraphicFrameNodes = (graphicFrames) => {
    const result = [];
    for (const frame of graphicFrames) {
      const graphicTypeUri = getAttributeByPath(
        [frame],
        ["a:graphic", "a:graphicData", "$"]
      ).uri;
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
  };

  public static extractTableElements = (frame) => {
    const rawTable = getAttributeByPath(
      [frame],
      ["a:graphic", "a:graphicData", "a:tbl"]
    );
    const rawRows = rawTable[0]["a:tr"] ? rawTable[0]["a:tr"] : [];

    const tableRows = rawRows.map((row) => {
      let cols = row["a:tc"] ? row["a:tc"] : [];
      cols = cols.map((col) => {
        //can a:t have more values ? more than one in the array
        //return any other column info, eg width height
        return {
          text: getAttributeByPath([col], ["a:txBody", "a:p", "a:r", "a:t"])[0]
        };
      });
      return {
        cols: cols
      };
    });

    //TODO: return any other possible and helpful table info
    return {
      rows: tableRows
    };
  };
}
