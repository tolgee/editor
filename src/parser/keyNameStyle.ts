import { StyledComponent } from "@emotion/styled";

export type KeyNameChipColors = {
  border: string;
  background: string;
  text: string;
};

const DEFAULT_COLORS: KeyNameChipColors = {
  border: "#BBC2CB",
  background: "#F0F2F4",
  text: "#4D5B6E",
};

type Props = {
  styled: (component: any) => any;
  colors?: KeyNameChipColors;
  component?: any;
};

export const generateKeyNameStyle = ({
  styled,
  colors = DEFAULT_COLORS,
  component = "div",
}: Props): StyledComponent<any> => {
  return styled(component)`
    & .keyname-msgctxt-widget {
      display: inline-flex;
      vertical-align: text-top;
      align-items: center;
      justify-content: center;
      min-width: 15px;
      border: 1px solid ${colors.border};
      background-color: ${colors.background};
      color: ${colors.text};
      border-radius: 10px;
      padding: 0px 7px;
      font-size: 12px;
      user-select: none;
      margin: 0px 4px 0px 1px;
      overflow: hidden;
      font-family: monospace;
    }
  `;
};
