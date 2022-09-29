//require("module-alias/register");
import { PowerpointDetails } from "airppt-models-plus/pptdetails";
import { PowerpointElementParser, PptGlobalsParser, SlideParser } from "./parsers";

export class AirParser {
  constructor(private readonly PowerpointFilePath: string) {}

  public async ParsePowerPoint(): Promise<PowerpointDetails> {
    return new Promise<PowerpointDetails>(async (resolve, reject) => {
      try {
        const slidesLength = await PptGlobalsParser.getSlidesLength(this.PowerpointFilePath);
        const allSlides = [];

        const pptElementParser = new PowerpointElementParser();
        for (let i = 1; i <= slidesLength; i++) {
          allSlides.push(SlideParser.getSlideElements(pptElementParser, i, this.PowerpointFilePath));
        }

        Promise.allSettled(allSlides).then((result) => {
          const pptElements = result.map((slideElements) => {
            if (slideElements.status === "fulfilled") {
              return slideElements.value;
            }

            return [];
          });

          resolve({
            powerPointElements: pptElements,
            inputPath: this.PowerpointFilePath,
            slidesLength,
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
