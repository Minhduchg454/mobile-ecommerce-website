// src/features/theme/ThemeList.jsx
import React, { useEffect, useState } from "react";
import { ThemeCard, HorizontalScroller } from "../../components";
import {
  apiGetThemesWithProducts,
  apiGetThemes,
} from "../../services/catalog.api";

export const ThemeList = () => {
  const [themes, setThemes] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGetThemes();
        if (res?.success) setThemes(res.themes || []);
        else setErr(res?.message || "Không thể tải dữ liệu");
      } catch (e) {
        setErr(e?.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (err) return <div className="text-red-600 ml-2 md:ml-28">{err}</div>;

  return (
    <section className="w-full">
      {loading || themes.length === 0 ? (
        <div className="first:pl-2 first:md:pl-28 flex gap-4 md:mx-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-[100px] h-[150px] rounded-xl bg-gray-200/70 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <HorizontalScroller
          items={themes}
          keyExtractor={(t) => t.themeId}
          renderItem={(t) => (
            <ThemeCard
              name={t.themeName}
              slug={t.themeSlug}
              image={t.themeImage}
              color={t.themeColor}
              description={t.themeDescription}
            />
          )}
        />
      )}
    </section>
  );
};
