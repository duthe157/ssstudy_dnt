import React from "react";

type Props = React.SVGProps<SVGSVGElement>;
const Search = (props: Props) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 16C12.866 16 16 12.866 16 9C16 5.13401 12.866 2 9 2C5.13401 2 2 5.13401 2 9C2 12.866 5.13401 16 9 16Z"
        stroke="#9A9DAC"
        strokeWidth="1.50001"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.0278 18.0278L14 14"
        stroke="#9A9DAC"
        strokeWidth="1.50001"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Search;
