import React, { memo } from "react";
import { ClipLoader } from "react-spinners";

const Loading = () => {
  return (
    <div>
      <ClipLoader color="#000000" size={50} speedMultiplier={1.2} />
    </div>
  );
};

export default memo(Loading);
