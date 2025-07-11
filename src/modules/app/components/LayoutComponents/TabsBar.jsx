import { equalityDeep } from "lib0/function";
import useMainPanel from "../../hooks/useMainPanel";
import { mainPanelStore } from "../../stores/mainPanelStore";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { checkForYTree, YTree } from "yjs-orderedtree";
import { ScrollArea } from "@mantine/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../stores/appStore";
import useStoreHistory from "../../hooks/useStoreHistory";
import { ActionButton } from "./ActionBar";

export const TabsBar = ({ isNotesPanelAwake, refreshNotesPanel }) => {
  /**
   * @type {MainPanelState}
   * @typedef {Object} MainPanelState
   * @property {string} panelType - The current panel type (e.g., "home").
   * @property {*} mode - The current mode of the panel (can be null or specific mode).
   * @property {Array} breadcrumbs - An array of breadcrumb strings representing the navigation path.
   */
  const mainPanelState = mainPanelStore((state) => state.mainPanelState);
  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const setTabs = mainPanelStore((state) => state.setTabs);

  const isMd = appStore((state) => state.isMd);

  const [overflow, setOverflow] = useState(false);

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const { activatePanel } = useMainPanel();

  useEffect(() => {
    const newState = JSON.parse(JSON.stringify(mainPanelState));

    if (
      !tabs?.find((value) => {
        return equalityDeep(value, newState);
      })
    ) {
      const newTabs = JSON.parse(JSON.stringify(tabs));

      newTabs.push(newState);
      if (newTabs.length > 10) {
        newTabs.shift();
      }

      setTabs(newTabs);
    }
  }, [mainPanelState, setTabs]);

  useEffect(() => {
    const content = document.getElementById("TabsContent");
    const scrollArea = document.getElementById("TabsScrollArea");

    if (!content || !scrollArea) return;

    const checkOverflow = () => {
      if (
        content.getBoundingClientRect().width >
        scrollArea.getBoundingClientRect().width
      ) {
        setOverflow(true);
      } else setOverflow(false);
    };

    const ro = new ResizeObserver(() => {
      checkOverflow();
    });

    ro.observe(content);
    ro.observe(scrollArea);

    checkOverflow();

    return () => {
      ro.unobserve(content);
      ro.unobserve(scrollArea);
    };
  }, []);

  return (
    <>
      <div
        data-tauri-drag-region
        className="border-b flex w-fit z-1000 border-appLayoutBorder h-full min-h-full text-appLayoutText font-sans px-1"
      >
        <ActionButton
          onClick={() => {
            activatePanel("home", null, []);
          }}
          className={`${false && "bg-appLayoutPressed"}`}
        >
          <div className={`h-full w-actionBarButtonIconSize relative`}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              key="homeButton"
              className="icon-[material-symbols-light--home] w-full h-full top-0 left-0 absolute bg-appLayoutText"
            ></motion.span>
          </div>
        </ActionButton>

        <ActionButton
          onClick={() => {
            if (canGoBack) {
              goBack();
            }
          }}
          disabled={!canGoBack}
        >
          <div className="h-full w-actionBarButtonIconSize relative">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: canGoBack ? 1 : 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              key="historyGoBack"
              className="icon-[material-symbols-light--arrow-back-rounded] w-full h-full top-0 left-0 absolute bg-appLayoutText"
            ></motion.span>
          </div>
        </ActionButton>
        <ActionButton
          onClick={() => {
            if (canGoForward) {
              goForward();
            }
          }}
          disabled={!canGoForward}
        >
          <div className="h-full w-actionBarButtonIconSize relative">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: canGoForward ? 1 : 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              key="historyGoForward"
              className="icon-[material-symbols-light--arrow-forward-rounded] w-full h-full top-0 left-0 absolute bg-appLayoutText"
            ></motion.span>
          </div>
        </ActionButton>
      </div>
      <ScrollArea
        overscrollBehavior="none"
        scrollbars="x"
        type="hover"
        id="TabsScrollArea"
        classNames={{
          root: `grow basis-0 min-w-0 h-full min-h-full ${
            overflow && "border-x border-appLayoutBorder"
          }`,
          scrollbar: `bg-transparent hover:bg-transparent p-0 h-scrollbarSize`,
          thumb: `bg-appLayoutBorder rounded-t-full hover:!bg-appLayoutInverseHover`,
          viewport: `h-full w-full`,
          content: `h-full w-full`,
        }}
      >
        <div
          id="TabsContent"
          className="w-fit min-w-full h-full z-[4] flex items-center"
        >
          <AnimatePresence>
            {tabs?.map((tab) => {
              const { panelType, mode, breadcrumbs } = tab;

              return (
                <motion.div
                  key={
                    breadcrumbs.length >= 1
                      ? breadcrumbs[0] +
                        "-" +
                        breadcrumbs[breadcrumbs.length - 1]
                      : panelType
                  }
                  initial={{ opacity: 0, width: 0 }}
                  animate={{
                    opacity: 1,
                    width: isMd
                      ? `var(--tabWidth)`
                      : `calc(var(--tabWidth) * 0.7)`,
                  }}
                  exit={{ opacity: 0, width: 0 }}
                  className="h-full overflow-x-hidden overflow-ellipsis"
                >
                  <TabButton
                    panelType={panelType}
                    mode={mode}
                    breadcrumbs={breadcrumbs}
                    isRemoveAvailable={tabs.length > 1}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          <UnusedSpace />
        </div>
      </ScrollArea>
      <div
        data-tauri-drag-region
        className="border-b flex w-fit z-1000 border-appLayoutBorder h-full min-h-full text-appLayoutText font-sans px-1"
      >
        <NotesPanelOpenButton
          isNotesPanelAwake={isNotesPanelAwake}
          refreshNotesPanel={refreshNotesPanel}
        />
      </div>
    </>
  );
};

const TabButton = ({
  panelType,
  mode,
  breadcrumbs,
  isRemoveAvailable = true,
}) => {
  const dndRef = useRef(null);

  const setFocusedItem = appStore((state) => state.setFocusedItem);

  const setActivity = appStore((state) => state.setActivity);
  const setLibraryId = appStore((state) => state.setLibraryId);
  const setTemplateId = appStore((state) => state.setTemplateId);

  const mainPanelState = mainPanelStore((state) => state.mainPanelState);

  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const setTabs = mainPanelStore((state) => state.setTabs);

  const { activatePanel } = useMainPanel();

  const [label, setLabel] = useState("DEFAULT");
  const [icon, setIcon] = useState(
    <span className="icon-[icon-park-outline--dot] w-full h-full"></span>
  );

  const action = useCallback(() => {
    if (panelType === "libraries") {
      setActivity("libraries");
      setLibraryId(breadcrumbs[0]);
    }

    if (panelType === "templates") {
      setActivity("templates");
    }

    activatePanel(panelType, mode, breadcrumbs);
  }, [panelType, mode, breadcrumbs, activatePanel, setActivity, setLibraryId]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: () => {
      if (panelType === "libraries") {
        return {
          appItemType: "libraries",
          id: breadcrumbs[breadcrumbs.length - 1],
          libraryId: breadcrumbs[0],
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "templates") {
        return {
          appItemType: "templates",
          id: breadcrumbs[0],
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "dictionary") {
        return {
          appItemType: "dictionary",
          id: breadcrumbs[0],
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "settings") {
        return {
          appItemType: "settings",
          id: null,
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      } else if (panelType === "home") {
        return {
          appItemType: "home",
          id: null,
          tabProps: {
            panelType,
            mode,
            breadcrumbs,
          },
        };
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [areaSelected, setAreaSelected] = useState("");

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem, monitor) => {
      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (
        equalityDeep(draggedItem.tabProps, { panelType, mode, breadcrumbs })
      ) {
        setAreaSelected("");
        return;
      }

      const tabDropIndex = tabs.findIndex((x) =>
        equalityDeep(x, { panelType, mode, breadcrumbs })
      );

      const hoverBoundingRect = dndRef.current.getBoundingClientRect();
      const buffer = 0; // pixels to define the top/bottom sensitive area
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      const middle = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      const tabDraggedIndex = tabs.findIndex((x) =>
        equalityDeep(x, draggedItem.tabProps)
      );

      if (tabDraggedIndex !== -1) {
        if (hoverClientX < middle && tabDraggedIndex !== tabDropIndex - 1) {
          setAreaSelected("left");
        } else if (
          hoverClientX >= middle &&
          tabDraggedIndex !== tabDropIndex + 1
        ) {
          setAreaSelected("right");
        } else {
          setAreaSelected("");
        }
      } else {
        if (hoverClientX < middle) {
          setAreaSelected("left");
        } else if (hoverClientX >= middle) {
          setAreaSelected("right");
        } else {
          setAreaSelected("");
        }
      }
    },
    drop: (draggedItem, monitor) => {
      // If a nested drop already handled this event, do nothing.
      if (monitor.didDrop()) return;

      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (
        equalityDeep(draggedItem.tabProps, { panelType, mode, breadcrumbs })
      ) {
        setAreaSelected("");
        return;
      }

      const tabDropIndex = tabs.findIndex((x) =>
        equalityDeep(x, { panelType, mode, breadcrumbs })
      );

      const tabDraggedIndex = tabs.findIndex((x) =>
        equalityDeep(x, draggedItem.tabProps)
      );

      const hoverBoundingRect = dndRef.current.getBoundingClientRect();
      const buffer = 0; // pixels to define the top/bottom sensitive area
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      const middle = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      if (tabDraggedIndex !== -1) {
        if (hoverClientX < middle && tabDraggedIndex !== tabDropIndex - 1) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          let element = newTabs[tabDraggedIndex];
          newTabs.splice(tabDraggedIndex, 1);
          newTabs.splice(tabDropIndex, 0, element);

          setTabs(newTabs);
        } else if (
          hoverClientX >= middle &&
          tabDraggedIndex !== tabDropIndex + 1
        ) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          let element = newTabs[tabDraggedIndex];
          newTabs.splice(tabDraggedIndex, 1);
          newTabs.splice(tabDropIndex + 1, 0, element);

          setTabs(newTabs);
        }
      } else {
        if (hoverClientX < middle && tabDraggedIndex !== tabDropIndex - 1) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          newTabs.splice(tabDropIndex, 0, draggedItem.tabProps);

          setTabs(newTabs);
        } else if (
          hoverClientX >= middle &&
          tabDraggedIndex !== tabDropIndex + 1
        ) {
          const newTabs = JSON.parse(JSON.stringify(tabs));

          newTabs.splice(tabDropIndex + 1, 0, draggedItem.tabProps);

          setTabs(newTabs);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  drag(drop(dndRef));

  useEffect(() => {
    const rootId = breadcrumbs[0];
    const youngestId = breadcrumbs[breadcrumbs.length - 1];
    const isAtRoot = youngestId === rootId;

    if (panelType === "libraries") {
      if (isAtRoot) {
        const callback = () => {
          setLabel(
            dataManagerSubdocs
              .getLibrary(rootId)
              .getMap("library_props")
              .get("item_properties")["item_title"]
          );
        };

        dataManagerSubdocs
          .getLibrary(rootId)
          .getMap("library_props")
          .observe(callback);

        callback();

        return () => {
          dataManagerSubdocs
            .getLibrary(rootId)
            .getMap("library_props")
            .unobserve(callback);
        };
      }

      if (
        !dataManagerSubdocs.getLibrary(rootId) ||
        !checkForYTree(
          dataManagerSubdocs.getLibrary(rootId).getMap("library_directory")
        )
      ) {
        return null;
      }

      const ytree = new YTree(
        dataManagerSubdocs.getLibrary(rootId).getMap("library_directory")
      );

      const itemMap = ytree.getNodeValueFromKey(youngestId);

      const callback = () => {
        setLabel(itemMap.get("item_properties")["item_title"]);
      };

      itemMap.observe(callback);

      callback();

      return () => {
        itemMap?.unobserve(callback);
      };
    } else if (panelType === "templates") {
      setIcon(<span className="icon-[carbon--template] w-full h-full"></span>);
      setLabel(rootId);
    } else if (panelType === "dictionary") {
      setIcon(
        <span className="icon-[material-symbols-light--match-word-rounded] w-full h-full"></span>
      );
      setLabel(rootId);
    } else if (panelType === "settings") {
      setIcon(
        <span className="icon-[material-symbols-light--settings] w-full h-full"></span>
      );
      setLabel("Settings");
    } else if (panelType === "home") {
      setIcon(
        <span className="icon-[material-symbols-light--home] w-full h-full"></span>
      );
      setLabel("Home");
    }
  }, [panelType, breadcrumbs]);

  useEffect(() => {
    if (
      equalityDeep(mainPanelState, {
        panelType,
        mode,
        breadcrumbs,
      })
    ) {
      dndRef.current?.scrollIntoView();
    }
  }, [mainPanelState, breadcrumbs, mode, panelType]);

  return (
    <div
      ref={dndRef}
      className={`h-full min-h-full w-full flex items-center justify-start gap-1 pr-1
          transition-colors duration-200 font-sans

          border

          ${isDragging && "opacity-30"} 

          ${(!isOverCurrent || (isOverCurrent && areaSelected === "")) && ""}
          
          ${
            isOverCurrent &&
            areaSelected === "left" &&
            `border-r-appLayoutBorder border-l-appLayoutHighlight`
          }
          
          ${
            isOverCurrent &&
            areaSelected === "right" &&
            `border-l-appLayoutBorder border-r-appLayoutHighlight`
          }
         
          ${
            equalityDeep(mainPanelState, {
              panelType,
              mode,
              breadcrumbs,
            })
              ? "border-t-appLayoutHighlight border-x-appLayoutBorder border-b-transparent"
              : "border-t-transparent border-b-appLayoutBorder border-x-transparent hover:bg-appLayoutInverseHover "
          }
        `}
    >
      <button
        autoFocus
        onClick={action}
        className={`grow basis-0 min-w-0 h-full min-h-full flex items-center justify-start focus:-outline-offset-4  focus:outline-appLayoutTextMuted overflow-x-hidden overflow-y-hidden overflow-ellipsis`}
      >
        <span className="w-tabsIconSize h-tabsIconSize p-1">{icon}</span>
        <div className="grow min-w-0 pr-4 basis-0 h-full flex items-center text-nowrap overflow-x-hidden overflow-y-hidden overflow-ellipsis text-tabsFontSize">
          {label}
        </div>
      </button>
      {isRemoveAvailable && (
        <button
          onClick={() => {
            const newTabs = JSON.parse(JSON.stringify(tabs));
            const tabIndex = tabs.findIndex((x) =>
              equalityDeep(x, { panelType, mode, breadcrumbs })
            );

            newTabs.splice(tabIndex, 1);

            if (newTabs.length > 0) {
              setTabs(newTabs);

              activatePanel(
                newTabs[newTabs.length - 1].panelType,
                newTabs[newTabs.length - 1].mode,
                newTabs[newTabs.length - 1].breadcrumbs
              );
            }
          }}
          className="min-w-tabsDeleteIconSize w-tabsDeleteIconSize h-tabsDeleteIconSize p-px rounded-md hover:text-appLayoutHighlight hover:bg-appLayoutInverseHover"
        >
          <span className="icon-[iwwa--delete] w-full h-full"></span>
        </button>
      )}
    </div>
  );
};

const UnusedSpace = ({ offset = false }) => {
  const dndRef = useRef();

  /**
   * @type {Array<MainPanelState>}
   */
  const tabs = mainPanelStore((state) => state.tabs);

  const setTabs = mainPanelStore((state) => state.setTabs);

  const [isHovering, setIsHovering] = useState(false);

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem, monitor) => {
      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (equalityDeep(draggedItem.tabProps, tabs[tabs.length - 1])) {
        setIsHovering(false);
        return;
      }

      setIsHovering(true);
    },
    drop: (draggedItem, monitor) => {
      // If a nested drop already handled this event, do nothing.
      if (monitor.didDrop()) return;

      if (!dndRef.current) return;

      if (!draggedItem.tabProps) return;

      if (equalityDeep(draggedItem.tabProps, tabs[tabs.length - 1])) {
        setIsHovering(false);
        return;
      }

      const tabDraggedIndex = tabs.findIndex((x) =>
        equalityDeep(x, draggedItem.tabProps)
      );

      if (tabDraggedIndex !== -1) {
        const newTabs = JSON.parse(JSON.stringify(tabs));

        let element = newTabs[tabDraggedIndex];
        newTabs.splice(tabDraggedIndex, 1);
        newTabs.push(element);

        setTabs(newTabs);
      } else {
        const newTabs = JSON.parse(JSON.stringify(tabs));

        newTabs.push(draggedItem.tabProps);

        setTabs(newTabs);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  drop(dndRef);

  return (
    <div
      data-tauri-drag-region
      ref={dndRef}
      style={{
        height: "100%",
      }}
      className={`border-b border-b-appLayoutBorder
        ${
          isOverCurrent && isHovering
            ? ` border-l border-l-appLayoutHighlight`
            : ""
        }

        
        ${offset ? "w-2" : "grow basis-0"}
        `}
    ></div>
  );
};

const NotesPanelOpenButton = ({ isNotesPanelAwake, refreshNotesPanel }) => {
  const setNotesPanelOpened = appStore((state) => state.setNotesPanelOpened);
  const notesPanelOpened = appStore((state) => state.notesPanelOpened);
  const isMd = appStore((state) => state.isMd);

  const mainPanelState = mainPanelStore((state) => state.mainPanelState);

  const { panelType } = mainPanelState;

  return (
    <AnimatePresence>
      {panelType === "libraries" && (
        <ActionButton
          onClick={() => {
            if (isMd) {
              setNotesPanelOpened(!notesPanelOpened);
            } else {
              if (!(notesPanelOpened && isNotesPanelAwake)) {
                setNotesPanelOpened(true);
                refreshNotesPanel();
              }
            }
          }}
          className={`${false && "bg-appLayoutPressed"}`}
        >
          <div className={`h-full w-actionBarButtonIconSize relative`}>
            <AnimatePresence mode="wait">
              {notesPanelOpened && (isMd || isNotesPanelAwake) ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key="homeButton"
                  className="icon-[solar--telescope-bold] w-[100%] h-[100%]"
                ></motion.span>
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key="homeButton"
                  className="icon-[solar--telescope-bold-duotone] w-[100%] h-[100%]"
                ></motion.span>
              )}
            </AnimatePresence>
          </div>
        </ActionButton>
      )}
    </AnimatePresence>
  );
};
