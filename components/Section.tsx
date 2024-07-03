import React, { FC, PropsWithChildren } from "react";

const Section: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className="w-full h-full bg-[rgba(17,25,40,0.75)] backdrop-blur-[18px] backdrop-saturate-[180%] flex justify-between">
      {children}
    </div>
  );
};

export default Section;
