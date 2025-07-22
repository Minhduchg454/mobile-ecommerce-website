// components/CustomMarkdownEditor.jsx
import React, { useRef, useEffect } from "react";

const CustomMarkdownEditor = ({
  name,
  label,
  value = "",
  changeValue,
  height = 100,
  invalidFields = [],
  setInvalidFields = () => {},
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // Auto resize textarea
    const resize = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };

    resize();
    el.addEventListener("input", resize);
    return () => el.removeEventListener("input", resize);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full my-4">
      {label && <label className="font-semibold">{label}</label>}
      <textarea
        ref={textareaRef}
        className="w-full border border-gray-300 rounded p-3 resize-y min-h-[100px] max-h-[500px] focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value}
        onChange={(e) => {
          changeValue({ [name]: e.target.value });
          setInvalidFields((prev) => prev.filter((item) => item.name !== name));
        }}
        rows={4}
        style={{ minHeight: height }}
      />
      {invalidFields.some((el) => el.name === name) && (
        <small className="text-red-500 text-sm italic">
          {invalidFields.find((el) => el.name === name)?.message}
        </small>
      )}
    </div>
  );
};

export default CustomMarkdownEditor;
