declare module "bidi-js" {
  export type BidiCharTypeName =
    | "L"
    | "R"
    | "AL"
    | "EN"
    | "ES"
    | "ET"
    | "AN"
    | "CS"
    | "NSM"
    | "BN"
    | "B"
    | "S"
    | "WS"
    | "ON"
    | "LRE"
    | "LRO"
    | "RLE"
    | "RLO"
    | "PDF"
    | "LRI"
    | "RLI"
    | "FSI"
    | "PDI";

  export interface Bidi {
    getBidiCharTypeName(char: string): BidiCharTypeName;
  }

  export default function bidiFactory(): Bidi;
}
