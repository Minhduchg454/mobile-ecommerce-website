import React, { memo } from "react";
import { Editor } from "@tinymce/tinymce-react";

const MarkdownEditor = ({
  label,
  value,
  changeValue,
  name,
  invalidFields,
  setInvalidFields,
  setIsFocusDescription,
  height = 500, // 👈 chiều cao mặc định
}) => {
  return (
    <div className="flex flex-col ">
      <span className="">{label}</span>
      <Editor
        apiKey="x966ukewe6wwp2dli2u8f41xmjei8omxtk49m356em9qoizc"
        initialValue={value}
        init={{
          height: 300,
          menubar: false,
          plugins: ["link", "lists"],
          toolbar:
            "bold italic | bullist numlist | alignleft aligncenter alignright | link",
          content_style: `
      body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
      html, body { border-radius: 12px; } /* ✅ Bo góc nội dung */
    `,
          branding: false,
          statusbar: false,
        }}
        onChange={(e) => {
          const content = e.target.getContent();
          changeValue({ [name]: content });
        }}
        onFocus={() => {
          setInvalidFields && setInvalidFields([]);
        }}
        textareaClassName="rounded-xl border border-gray-300" // ✅ Thêm class Tailwind cho vỏ ngoài
      />
      {invalidFields?.some((el) => el.name === name) && (
        <small className="text-main text-sm">
          {invalidFields?.find((el) => el.name === name)?.mes}
        </small>
      )}
    </div>
  );
};

export default memo(MarkdownEditor);
