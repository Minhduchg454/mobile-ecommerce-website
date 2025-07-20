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
  height = 500,
}) => {
  return (
    <div className="flex flex-col ">
      <span className="">{label}</span>
      <Editor
        apiKey="x966ukewe6wwp2dli2u8f41xmjei8omxtk49m356em9qoizc"
        initialValue={value}
        init={{
          menubar: false,
          plugins: ["link", "lists", "autoresize", "paste"],
          toolbar:
            "undo redo | bold italic underline | bullist numlist | alignleft aligncenter alignright | link",
          branding: false,
          statusbar: false,
          min_height: height,
          max_height: 1000,
          autoresize_bottom_margin: 20,
          content_style: `
      body {
        font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 15px;
        line-height: 1.6;
        padding: 12px;
      }
      p { margin: 0 0 10px; }
      ul, ol { padding-left: 20px; margin-bottom: 10px; }
      strong { font-weight: bold; }
      em { font-style: italic; }
      html, body { border-radius: 12px; }
    `,
        }}
        onChange={(e) => {
          const content = e.target.getContent();
          changeValue({ [name]: content });
        }}
        onFocus={() => {
          setInvalidFields && setInvalidFields([]);
        }}
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
