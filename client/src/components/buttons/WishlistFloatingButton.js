import React, { memo } from "react";
import { WishlistButton } from "components";

const WishlistFloatingButton = ({ className = "" }) => {
  return (
    <WishlistButton
      variant="floating"
      size="lg"
      showBadge={true}
      className={className}
    />
  );
};

export default memo(WishlistFloatingButton); 