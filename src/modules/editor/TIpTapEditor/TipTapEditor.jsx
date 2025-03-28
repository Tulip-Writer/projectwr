import React, { useEffect, useMemo, useRef, useState } from "react";
import TipTapToolbar from "./TipTapToolbar";

import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Highlight from "@tiptap/extension-highlight";
import Collaboration from "@tiptap/extension-collaboration";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Blockquote from "@tiptap/extension-blockquote";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import OrderedList from "@tiptap/extension-ordered-list";
import TabIndentExtension from "./Extensions/TabIndentExtension";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";

import { ContextMenu } from "radix-ui";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";

import { useDeviceType } from "../../app/ConfigProviders/DeviceTypeProvider";
import { TipTapEditorDefaultPreferences } from "./TipTapEditorDefaultPreferences";
import loremIpsum from "../lorem";
import ProsemirrorProofreadExtension from "./Extensions/ProsemirrorProofreadExtension";
import ProsemirrorVirtualCursor from "./Extensions/ProsemirrorVirtualCursorExtension";
import dictionaryManager from "../../app/lib/dictionary";
import { wait } from "lib0/promise";
import { appStore } from "../../app/stores/appStore";

const content = "<p>Hello World!</p>";

const { desktopDefaultPreferences, mobileDefaultPreferences } =
  TipTapEditorDefaultPreferences;

const TiptapEditor = ({
  hunspell,
  yXmlFragment,
  setHeaderOpened,
  mode = "editPaper",
  preferences,
}) => {
  console.log("Tiptap Editor Rendering");

  const { deviceType } = useDeviceType();
  const isMobile = deviceType === "mobile";

  const [editorRef, setEditorFocus] = useFocus();

  const lastScrollTopRef = useRef(0); // Stores last scroll position

  const defaultPreferences = isMobile
    ? mobileDefaultPreferences
    : desktopDefaultPreferences;

  const editorPreferences = preferences || defaultPreferences;

  const setSearchQuery = appStore((state) => state.setSearchQuery);
  const [selectingError, setSelectingError] = useState("");

  const {
    width,
    gapTop,
    paddingTop, // Updated from marginTop
    paddingLeft, // Updated from marginLeft
    paddingRight, // Updated from marginRight
    paddingBottom, // Updated from marginBottom
    font,
    fontSize,
    lineHeight,
    marginBottom,
    backgroundColor,
    paperBorderWidth,
    paperColor,
    paperBorderColor,
    roundRadius,
    paperShadow,
    paperShadowColor,

    h1FontSize,
    h1LineHeight,
    h1MarginBottom,

    h2FontSize,
    h2LineHeight,
    h2MarginBottom,

    h3FontSize,
    h3LineHeight,
    h3MarginBottom,

    h4FontSize,
    h4LineHeight,
    h4MarginBottom,

    h5FontSize,
    h5LineHeight,
    h5MarginBottom,

    listPaddingLeft,
    listMarginTop,
    listMarginBottom,
    hrMarginTop,
    hrMarginBottom,
    hrBorderColor,
  } = editorPreferences.paperPreferences;

  const { dividerColor } = editorPreferences.toolbarPreferences;

  const extensions = useRef([
    Document,
    Paragraph,
    Text,
    Collaboration.configure({
      fragment: yXmlFragment,
    }),
    TabIndentExtension.configure({
      spaces: 8,
    }),
    Strike,
    Bold,
    Italic,
    Underline,
    Subscript,
    Superscript,
    TextStyle.configure({ mergeNestedSpanStyles: true }),
    Highlight.configure({ multicolor: true }),
    Blockquote,
    ListItem,
    BulletList,
    OrderedList,
    HardBreak,
    Heading.configure({
      levels: [1, 2, 3, 4, 5],
    }),
    HorizontalRule,
    Image,
    Typography,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    ProsemirrorProofreadExtension,
    ProsemirrorVirtualCursor,
  ]);

  const previewTemplateExtensions = useRef([
    Document,
    Paragraph,
    Text,
    TabIndentExtension.configure({
      spaces: 8,
    }),
    Strike,
    Bold,
    Italic,
    Underline,
    Subscript,
    Superscript,
    TextStyle.configure({ mergeNestedSpanStyles: true }),
    Highlight.configure({ multicolor: true }),
    Blockquote,
    ListItem,
    BulletList,
    OrderedList,
    HardBreak,
    Heading.configure({
      levels: [1, 2, 3, 4, 5],
    }),
    HorizontalRule,
    Image,
    Typography,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ]);

  useEffect(() => {
    const container = document.getElementById("EditableContainer");
    if (!container || !isMobile) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;

      // Detect scrolling up
      if (currentScrollTop < lastScrollTopRef.current) {
        setHeaderOpened(true);
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isMobile, setHeaderOpened]);

  const editor = useEditor({
    content: mode === "previewTemplate" ? loremIpsum : content,
    extensions:
      mode === "previewTemplate"
        ? previewTemplateExtensions.current
        : extensions.current,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    onUpdate({ editor }) {
      console.log("UPDATE!");
      console.log("Editor Updated");
      const selection = editor.state.selection;
      const coords = editor.view.coordsAtPos(selection.from);
      const container = document.getElementById("EditableContainer");
      const containerRect = container.getBoundingClientRect();
      const relativeY = coords.top - containerRect.top;

      let buffer = isMobile ? 100 : 200;
      let bottomBuffer = isMobile ? 200 : 400;

      let scrollAdjustment = 0;

      if (relativeY + bottomBuffer > container.clientHeight) {
        scrollAdjustment = relativeY + bottomBuffer - container.clientHeight;
        setHeaderOpened(false);
      } else if (relativeY < buffer) {
        scrollAdjustment = relativeY - buffer;
      }

      if (scrollAdjustment !== 0) {
        console.log("Scroll adjustment: ", scrollAdjustment);

        setTimeout(() => {
          container.scrollBy({
            top: scrollAdjustment,
            behavior: "smooth",
          });
        }, 2);
      }
    },
    onSelectionUpdate({ editor }) {
      const domSelection = window.getSelection();
      let errorText = "";
      if (domSelection?.anchorNode) {
        let node = domSelection.anchorNode.parentElement;
        while (node) {
          if (
            node.tagName.toLowerCase() === "span" &&
            node.classList.contains("spelling-error")
          ) {
            errorText = node.textContent;
            break;
          }
          node = node.parentElement;
        }
      }
      console.log("Selecting Error Text:", errorText);
      setSelectingError(errorText);
    },
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isHighlighted: editor.isActive("highlight"),
      isStriked: editor.isActive("strike"),
      isUnderlined: editor.isActive("underline"),
      isSubscript: editor.isActive("subscript"),
      isSuperscript: editor.isActive("superscript"),
      isBlockQuote: editor.isActive("blockquote"),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isAlign: editor.isActive("textAlign"),
    }),
  });

  return (
    <div
      id="EditorContainer"
      className="h-full w-full flex flex-col items-center"
    >
      <style>
        {`
          .tiptap {
            min-height: 20rem;
            padding: ${paddingTop}rem 
                      ${paddingRight}rem 
                      ${paddingBottom}rem 
                      ${paddingLeft}rem;
          }

          #EditorContainer h1 {
            font-size: ${h1FontSize}rem;
            line-height: ${h1LineHeight}rem;
            margin-bottom: ${h1MarginBottom}rem;
          }
          #EditorContainer h2 {
            font-size: ${h2FontSize}rem;
            line-height: ${h2LineHeight}rem;
            margin-bottom: ${h2MarginBottom}rem;
          }
          #EditorContainer h3 {
            font-size: ${h3FontSize}rem;
            line-height: ${h3LineHeight}rem;
            margin-bottom: ${h3MarginBottom}rem;
          }
          #EditorContainer h4 {
            font-size: ${h4FontSize}rem;
            line-height: ${h4LineHeight}rem;
            margin-bottom: ${h4MarginBottom}rem;
          }
          #EditorContainer h5 {
            font-size: ${h5FontSize}rem;
            line-height: ${h5LineHeight}rem;
            margin-bottom: ${h5MarginBottom}rem;
          }

          #EditorContainer p {
            font-size: ${fontSize}rem;
            line-height: ${lineHeight}rem;
            margin: 0;
          }

          #EditorContainer {
            font-size: ${fontSize}rem;
            line-height: ${lineHeight}rem;
          }

          #EditorContainer ol, #EditorContainer ul {
            padding-left: ${listPaddingLeft}rem;
            margin: ${listMarginTop}rem 1rem ${listMarginBottom}rem 0.4rem;
          }

          #EditorContainer hr {
            cursor: pointer;
            margin: ${hrMarginTop}rem 0 ${hrMarginBottom}rem 0;
            border-top: 1px solid ${hrBorderColor};
          }

          .spelling-error {
            background-color: #ff00001a;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
            border-bottom: 1px solid #ff0000e6;
          }
        `}
      </style>

      <div
        id="EditableToolbar"
        style={{
          height: `${editorPreferences.toolbarPreferences.toolbarHeight}rem`,
          minHeight: `${editorPreferences.toolbarPreferences.toolbarHeight}rem`,
          backgroundColor: `${editorPreferences.toolbarPreferences.backgroundColor}`,
        }}
        className={`
            w-full min-w-0
            ${isMobile ? "order-5" : "order-1"}
          `}
      >
        <TipTapToolbar
          editor={editor}
          toolbarPreferences={editorPreferences.toolbarPreferences}
        />
      </div>

      <div
        className={`w-full h-px flex-shrink-0 ${
          isMobile ? "order-4" : "order-2"
        }`}
        style={{ backgroundColor: `${dividerColor}` }}
      ></div>

      <div
        id="EditableContainer"
        className={`flex-grow w-full flex justify-center 
           overflow-y-scroll min-h-0 text-neutral-200 z-1 order-3
          `}
        style={{
          paddingLeft: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
          backgroundColor: backgroundColor,
        }}
      >
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <EditorContent
              spellCheck={false}
              editor={editor}
              className={`h-fit outline-none focus:outline-none
            shadow-${isMobile ? "none" : paperShadow}
            shadow-black
            font-serif  
            `}
              style={{
                width: isMobile ? "100%" : `${width}rem`,
                minWidth: isMobile ? "100%" : `${width * 0.8}rem`,
                backgroundColor: `${paperColor}`,
                borderTopWidth: isMobile ? "0" : `${paperBorderWidth}px`,
                borderRightWidth: isMobile ? "0" : `${paperBorderWidth}px`,
                borderBottomWidth: isMobile ? "0" : `0`,
                borderLeftWidth: isMobile ? "0" : `${paperBorderWidth}px`,
                borderTopColor: `${paperBorderColor}`,
                borderLeftColor: `${paperBorderColor}`,
                borderRightColor: `${paperBorderColor}`,
                marginTop: isMobile ? "0" : `${gapTop}rem`,
                fontSize: `${fontSize}rem`,
                lineHeight: `${lineHeight}rem`,
                borderTopRightRadius: `${roundRadius}rem`,
                borderTopLeftRadius: `${roundRadius}rem`,
              }}
            />
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content
              className="ContextMenuContent"
              sideOffset={5}
              align="end"
            >
              {selectingError.trim().length > 0 && (
                <ContextMenu.Item
                  className="ContextMenuItem"
                  onClick={async () => {
                    dictionaryManager.addOrUpdateWord(selectingError, "", "");
                    await wait(1000);
                    editor.commands.forceSpellcheck();
                  }}
                >
                  {/* [bitcoin-icons--edit-outline] */}
                  <span className="icon-[material-symbols-light--add-2-rounded] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                  <span className="pb-px">Add word to dictionary</span>
                </ContextMenu.Item>
              )}

              <ContextMenu.Item
                className="ContextMenuItem"
                onClick={() => {
                  const textSelection = window
                    .getSelection()
                    ?.toString()
                    .trim();
                  setSearchQuery(textSelection);
                  console.log(document.getElementById("searchInput"));
                  setTimeout(() => {
                    document.getElementById("searchInput").focus();
                  }, 100);
                }}
              >
                {/* [bitcoin-icons--edit-outline] */}
                <span className="icon-[material-symbols-light--search] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span className="pb-px">Search in your library</span>
              </ContextMenu.Item>

              <ContextMenu.Label className="ContextMenuLabel">
                <span className="icon-[material-symbols-light--content-copy-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span className="pb-px">Use Ctrl+C to Copy</span>
              </ContextMenu.Label>

              <ContextMenu.Label className="ContextMenuLabel">
                <span className="icon-[material-symbols-light--content-paste] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span className="pb-px">Use Ctrl+V to Paste</span>
              </ContextMenu.Label>

              <ContextMenu.Label className="ContextMenuLabel">
                <span className="icon-[material-symbols-light--content-cut] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
                <span className="pb-px">Use Ctrl+X to Cut</span>
              </ContextMenu.Label>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </div>
    </div>
  );
};

export default React.memo(TiptapEditor);

// const updateVirtualCursor = (editor, fontSize) => {
//   const selection = editor.state.selection;
//   if (!selection.empty) {
//     editor.commands.hideVirtualCursor();
//     return;
//   }

//   const editable = document.querySelector(".tiptap");
//   const editableRect = editable.getBoundingClientRect();
//   const coords = editor.view.coordsAtPos(selection.from);

//   const domSelection = window.getSelection();
//   const anchorNode = domSelection.anchorNode;

//   const minFontSize = fontSize + 2;

//   if (anchorNode?.parentElement) {
//     if (anchorNode.parentElement.tagName === "DIV") {
//       const computedStyle = getComputedStyle(anchorNode);
//       fontSize = parseFloat(computedStyle.fontSize) || fontSize;
//     } else {
//       console.log("HERRE IN UPDATE VIRTUAL CURSOR: ");
//       const computedStyle = getComputedStyle(anchorNode.parentElement);
//       fontSize = parseFloat(computedStyle.fontSize) || fontSize;
//     }
//   }

//   console.log("Font size in uvc: ", fontSize);

//   editor.commands.addVirtualCursor({
//     top: coords.top - editableRect.top,
//     left: coords.left - editableRect.left,
//     fontSize: max(fontSize, minFontSize),
//   });
// };

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus];
};
