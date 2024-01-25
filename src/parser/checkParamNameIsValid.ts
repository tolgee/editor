export const checkParamNameIsValid = (input: string) => {
  return /^[^\p{White_Space}\p{Pattern_Syntax}]*$/uy.test(input);
};
