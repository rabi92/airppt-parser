import { CheckValidObject } from "../helpers/checkobj";
import ShapeParser from "./shapeparser";
import ParagraphParser from "./paragraphparser";
import SlideRelationsParser from "./relparser";

import { PowerpointElement } from "airppt-models/pptelement";
import GraphicFrameParser from "./graphicFrameParser";

/**
 * Entry point for all Parsers
 */
class PowerpointElementParser {
	private element;

	public getProcessedElement(rawElement, slideRelationships): PowerpointElement {
		SlideRelationsParser.setSlideRelations(slideRelationships);
		try {
			if (!rawElement) {
				return null;
			}
			this.element = rawElement;

			let elementName: string = "";
			let elementPosition;
			let elementOffsetPosition;
			let table = null;

			if (this.element["p:nvSpPr"]) {
				elementName =
					this.element["p:nvSpPr"][0]["p:cNvPr"][0]["$"]["title"] ||
					this.element["p:nvSpPr"][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");

					//elements must have a position, or else ignore them. TO-DO: Allow Placeholder positions
				if (!this.element["p:spPr"][0]["a:xfrm"]) {
					return null;
				}
				elementPosition = this.element["p:spPr"][0]["a:xfrm"][0]["a:off"][0]["$"];
				elementOffsetPosition = this.element["p:spPr"][0]["a:xfrm"][0]["a:ext"][0]["$"];
			}
			else if (this.element["p:nvPicPr"]) {
				//if the element is an image, get basic info like this
				elementName =
					this.element["p:nvPicPr"][0]["p:cNvPr"][0]["$"]["title"] ||
					this.element["p:nvPicPr"][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");

				if (!this.element["p:spPr"][0]["a:xfrm"]) {
					return null;
				}
				elementPosition = this.element["p:spPr"][0]["a:xfrm"][0]["a:off"][0]["$"];
				elementOffsetPosition = this.element["p:spPr"][0]["a:xfrm"][0]["a:ext"][0]["$"];
			}
			//check only if its the table, in future can be changed it to overall graphic types e.g. diagrams, charts. 
			//but for now only doing the tables.
			else if(CheckValidObject(this.element, '["a:graphic"][0]["a:graphicData"][0]["a:tbl"]')) {
				elementName =
					this.element["p:nvGraphicFramePr"][0]["p:cNvPr"][0]["$"]["title"] ||
					this.element["p:nvGraphicFramePr"][0]["p:cNvPr"][0]["$"]["name"].replace(/\s/g, "");

				if (!this.element["p:xfrm"]) {
					return null;
				}
				elementPosition = this.element["p:xfrm"][0]["a:off"][0]["$"];
				elementOffsetPosition = this.element["p:xfrm"][0]["a:ext"][0]["$"];

				table = GraphicFrameParser.extractTableElements(this.element);
			}

			let elementPresetType = CheckValidObject(this.element, '["p:spPr"][0]["a:prstGeom"][0]["$"]["prst"]') || "none";

			let paragraphInfo = CheckValidObject(this.element, '["p:txBody"][0]["a:p"][0]');

			let pptElement: PowerpointElement = {
				name: elementName,
				shapeType: ShapeParser.determineShapeType(elementPresetType),
				specialityType: ShapeParser.determineSpecialityType(this.element),
				elementPosition: {
					x: elementPosition.x,
					y: elementPosition.y
				},
				elementOffsetPosition: {
					cx: elementOffsetPosition.cx,
					cy: elementOffsetPosition.cy
				},
				table: table && table.rows.length > 0 ? table : null,
				paragraph: ParagraphParser.extractParagraphElements(paragraphInfo),
				shape: ShapeParser.extractShapeElements(this.element),
				links: SlideRelationsParser.resolveShapeHyperlinks(this.element),
				raw: rawElement
			};

			return pptElement;
		} catch (e) {
			console.warn("ERR could not parse element:", e);
			return null; //skip the element
		}
	}
}

export default PowerpointElementParser;
