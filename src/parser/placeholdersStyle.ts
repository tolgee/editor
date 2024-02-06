import { StyledComponent } from "@emotion/styled";

export type Placeholder = {
  border: string;
  background: string;
  text: string;
};

export type Placeholders = {
  variable: Placeholder;
  tag: Placeholder;
  variant: Placeholder;
};

const DEFAULT_COLORS = {
  variable: {
    border: "#7AD3C1",
    background: "#BEF3E9",
    text: "#008371",
  },
  tag: {
    border: "#F27FA6",
    background: "#F9C4D6",
    text: "#822343",
  },
  variant: {
    border: "#BBC2CB",
    background: "#F0F2F4",
    text: "#4D5B6E",
  },
} satisfies Placeholders;

type Props = {
  styled: (component: any) => any;
  colors?: Placeholders;
  component?: any;
};

/**
 * Function generating styled component without the dependecy on any styling library
 */
export const generatePlaceholdersStyle = ({
  styled,
  colors = DEFAULT_COLORS,
  component = "div",
}: Props): StyledComponent<any> => {
  return styled(component)`
    white-space: pre-wrap;
    & .placeholder-widget {
      display: inline-flex;
      vertical-align: text-top;
      align-items: center;
      justify-content: center;
      height: 18px;
      min-width: 15px;
      border: 1px solid ${colors.variable.border};
      background-color: ${colors.variable.background};
      color: ${colors.variable.text};
      border-radius: 10px;
      padding: 0px 7px;
      font-size: 12px;
      user-select: none;
      margin: 0px 1px;
      overflow: hidden;

      & > * {
        display: grid;
      }
    }
    & .placeholder-error {
      background: #ff000054;
    }

    & .placeholder-tagOpen {
      border: 1px solid ${colors.tag.border};
      background-color: ${colors.tag.background};
      color: ${colors.tag.text};
      border-radius: 10px 0px 0px 10px;
      padding-right: 6px;
    }

    & .placeholder-tagClose {
      border: 1px solid ${colors.tag.border};
      background-color: ${colors.tag.background};
      color: ${colors.tag.text};
      border-radius: 0px 10px 10px 0px;
      padding-left: 6px;
    }

    // in rtl mode, revert the placeholders direction
    &[dir="rtl"] .placeholder-tagOpen {
      border-radius: 0px 10px 10px 0px;
      padding-left: 6px;
    }
    &[dir="rtl"] .placeholder-tagClose {
      border-radius: 10px 0px 0px 10px;
      padding-right: 6px;
    }
  `;
};
