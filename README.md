### Project Overview
Wouldn't it be great if we could use a slideshow canvas as WSIWYG editor to rapidly design and ship UIs or start coding?

Airppt was built from the ground up to utilize the design elements of PPT presentations and reuse them anywhere. It is built with modularity, extensibility and flexibility in mind whilst abstracting a lot of the complexity. It's **not** a direct PPTX -> HTML converter; more like PPTX -> JSON -> HTML instead.

# airppt-parser

Powerpoint stores information in a series of complex XML mappings. Checkout the [OpenXML Spec](https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf) to get an idea of how [complex](http://officeopenxml.com/anatomyofOOXML-pptx.php) it really is.

The parser reads a extracted Powerpoint file and parses it to a standardized JSON object. The JSON object returned is defined as a `PowerPointElement`.
To extract the powerpoint, change its extension from `.pptx` to `.zip` and then extract it. Give path to that extracted folder. 

After utilizing the parser, we can pass it on to the [renderer module](https://github.com/rabi92/airppt-renderer#readme) to generate clean HTML/CSS, or you could use the object as you wish in your own application.

_Note: this renderer module is not being updated with the updates on this parser. We use our own renderer, which uses handlebars, and we define the templates in the [handlebars](https://handlebarsjs.com/) based on the `Powerpoint Element` structure that we get from this parser._

## Usage

I highly recommend looking at the [tests](https://github.com/rabi92/airppt-parser/tree/master/tests) folder. I continually keep that up-to-date. Be sure to get the latest package from [NPM](https://www.npmjs.com/package/airppt-parser-plus).

```javascript
let { AirParser } = require("airppt-parser");

let pptParser = new AirParser("./sample");
waitForParsing();

async function waitForParsing() {
	let result = await pptParser.ParsePowerPoint();

	//returns an array of parsable slides including
	//Powerpoint Elements
	console.log(result);
}
```

## Powerpoint Element

Here is the interface definition of a `PowerpointElement`:

```javascript
 export interface PowerpointElement {
	name: string; //or the name combined
	shapeType: string; //the preset type of shape as defined the Offixe XML schema
	specialityType: SpecialityType; //Do something special such as "images","textboxes","media"
	elementPosition: {
		//location to place the element
		x: number;
		y: number;
	};
	elementOffsetPosition: {
		cx: number;
		cy: number;
	};
	paragraph?: Array<Paragraph>;
	shape?: {
		border?: {
			thickness: number;
			color: string;
			type: BorderType;
			radius?: number;
		};
		fill: {
			fillType: FillType;
			fillColor: string;
		};
		opacity: number;
	};
	table?: {
		tableDesign?: TableDesign[],
		rows: [
			cols: []
		]
	};
	fontStyle?: {
		font: string;
		fontSize: number;
		fontColor: string;
	};
	links?: {
		Type: LinkType;
		Uri: string;
		//wherever or whichever element this might link do
	};
	raw?: any; //the entire unparsed element object
}
```

Further definitions of the interfaces and enums used, See the entire [interface](https://github.com/rabi92/airppt-models/blob/dev/pptelement.d.ts) here.
