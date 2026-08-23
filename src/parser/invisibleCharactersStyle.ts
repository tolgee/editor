import { StyledComponent } from "@emotion/styled";

export type InvisibleCharacterColors = {
  nonBreakingSpaceBackground: string;
  zeroWidthMarker: string;
};

const DEFAULT_COLORS: InvisibleCharacterColors = {
  nonBreakingSpaceBackground: "#a4d0ff",
  zeroWidthMarker: "#ff9800",
};

type Props = {
  styled: (component: any) => any;
  colors?: InvisibleCharacterColors;
  component?: any;
};

export const generateInvisibleCharactersStyle = ({
  styled,
  colors = DEFAULT_COLORS,
  component = "div",
}: Props): StyledComponent<any> => {
  return styled(component)`
    & .cm-invisible-char-nbsp {
      background-color: ${colors.nonBreakingSpaceBackground};
      border-radius: 2px;
    }

    & .cm-invisible-char-zero-width {
      display: inline-block;
      width: 2px;
      height: 1em;
      background-color: ${colors.zeroWidthMarker};
      vertical-align: text-bottom;
      border-radius: 1px;
    }
  `;
};
