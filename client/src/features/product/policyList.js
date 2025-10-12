import React, { useEffect, useState } from "react";
import { infoCards } from "../../ultils/contants";
import {
  FeatureInfoSlider,
  ThemeCard,
  HorizontalScroller,
  PolicyCard,
} from "../../components";

export const PolicyList = () => {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  return (
    <section className="w-full">
      <HorizontalScroller
        items={infoCards}
        keyExtractor={(t) => t.id}
        renderItem={(t) => (
          <PolicyCard
            color={t.color}
            icon={t.icon}
            title={t.title}
            description={t.description}
          />
        )}
      />
    </section>
  );
};
