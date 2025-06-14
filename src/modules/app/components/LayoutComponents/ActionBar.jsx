import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { appStore } from "../../stores/appStore";
import { motion, AnimatePresence } from "motion/react";
import { queryData } from "../../lib/search";
import { useEffect, useRef, useState } from "react";
import itemLocalStateManager from "../../lib/itemLocalState";
import { max, min } from "lib0/math";
import useStoreHistory from "../../hooks/useStoreHistory";
import {
  HoverListBody,
  HoverListButton,
  HoverListDivider,
  HoverListFooter,
  HoverListHeader,
  HoverListItem,
  HoverListShell,
} from "./HoverListShell";
import useMainPanel from "../../hooks/useMainPanel";
import { YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "../../lib/dataSubDoc";

const ActionBar = () => {
  const { deviceType } = useDeviceType();
  const appWindow = getCurrentWindow();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const sideBarOpened = appStore((state) => state.sideBarOpened);
  const setSideBarOpened = appStore((state) => state.setSideBarOpened);

  const panelOpened = appStore((state) => state.panelOpened);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const activity = appStore((state) => state.activity);
  const setActivity = appStore((state) => state.setActivity);

  const { activatePanel } = useMainPanel();

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const unlisten = getCurrentWindow().listen("tauri://resize", async () => {
      const x = await getCurrentWindow().isMaximized();

      setIsMaximized(x);
    });

    return () => {
      unlisten.then((unlistenFn) => unlistenFn());
    };
  }, []);

  return (
    <div
      data-tauri-drag-region
      id="actionBarContainer"
      className="border-b z-1000 border-appLayoutBorder w-full h-actionBarHeight min-h-actionBarHeight text-appLayoutText font-sans"
    >
      <div
        data-tauri-drag-region
        id="actionBar"
        className="w-full h-full flex justify-between gap-4 items-center relative"
      >
        <div className="h-full w-fit flex items-center gap-1">
          <div className="h-full w-activityBarWidth flex items-center justify-center">
            <div className="h-actionBarLogoSize w-actionBarLogoSize">
              <span
                key="logoButtonDisabled"
                className="icon-[ph--flower-tulip-thin] w-full h-full  bg-appLayoutText"
              ></span>
            </div>
          </div>

          <ActionButton onClick={() => setSideBarOpened(!sideBarOpened)}>
            <div className="h-full w-actionBarButtonIconSize relative">
              <AnimatePresence mode="sync">
                {sideBarOpened && (
                  <motion.span
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.6 }}
                    transition={{ duration: 0.05 }}
                    key="sideBarOpened"
                    className="icon-[tabler--layout-sidebar-left-collapse-filled] w-full h-full top-0 left-0 absolute bg-appLayoutTextMuted"
                  ></motion.span>
                )}
                {!sideBarOpened && (
                  <motion.span
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.6 }}
                    transition={{ duration: 0.05 }}
                    key="sideBarClosed"
                    className="icon-[tabler--layout-sidebar-left-expand] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                  ></motion.span>
                )}
              </AnimatePresence>
            </div>
          </ActionButton>

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
        </div>

        <div className="h-full w-fit flex">
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
          <SearchBar />
        </div>

        <div className="h-full w-fit flex items-center gap-1">
          <div className="h-full w-fit pl-1 flex items-center gap-1">
            <ActionButton
              onClick={() => {
                activatePanel("settings", null, []);
              }}
              className={`${false && "bg-appLayoutPressed"}`}
            >
              <div className={`h-full w-actionBarButtonIconSize relative`}>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key="settingsButton"
                  className="icon-[material-symbols-light--settings] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                ></motion.span>
              </div>
            </ActionButton>
          </div>

          {deviceType !== "mobile" && (
            <>
              <WindowButton
                className={``}
                buttonContent={
                  <span className="icon-[fluent--minimize-16-regular] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize"></span>
                }
                onClick={() => {
                  appWindow.minimize();
                }}
              />
              <WindowButton
                className={``}
                buttonContent={
                  isMaximized ? (
                    <span className="icon-[clarity--window-restore-line] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize"></span>
                  ) : (
                    <span className="icon-[fluent--maximize-16-regular] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize"></span>
                  )
                }
                onClick={() => {
                  appWindow.toggleMaximize();
                }}
              />
              <WindowButton
                destructive={true}
                className={``}
                buttonContent={
                  <span className="icon-[material-symbols-light--close-rounded] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize"></span>
                }
                onClick={() => {
                  appWindow.close();
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const ActionButton = ({
  onClick,
  className,
  children,
  disabled = false,
}) => {
  return (
    <div className="h-full py-1 w-fit">
      <button
        className={`h-full px-1 w-fit ${
          !disabled && "hover:bg-appLayoutInverseHover"
        } rounded-md flex items-center justify-center ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </div>
  );
};

const WindowButton = ({
  onClick,
  className,
  buttonContent,
  destructive = false,
}) => {
  return (
    <button
      className={`h-full flex items-center justify-center w-fit px-3 text-appLayoutHighlight ${
        destructive
          ? "hover:bg-appLayoutDestruct"
          : "hover:bg-appLayoutInverseHover"
      } ${className}`}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};

const SearchBar = () => {
  const { deviceType } = useDeviceType();

  const searchInputRef = useRef(null);

  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);
  const setItemMode = appStore((state) => state.setItemMode);
  const setActivity = appStore((state) => state.setActivity);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const searchQuery = appStore((state) => state.searchQuery);
  const setSearchQuery = appStore((state) => state.setSearchQuery);

  const { activatePanel } = useMainPanel();

  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (e) => {
    const { value } = e.target;
    setSearchQuery(value);
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      setSearchResults(queryData(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <div className="relative h-full py-1 w-actionBarSearchWidth/2 lg:w-actionBarSearchWidth min-w-0 ml-1 text-actionBarSearchTextSize">
      <input
        name="searchQuery"
        ref={searchInputRef}
        id="searchInput"
        tabIndex={4}
        placeholder=""
        value={searchQuery}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          paddingLeft: "calc(0.5rem + var(--actionBarButtonIconSize))",
        }}
        className={`h-full px-2 w-full focus:outline-none bg-appBackground hover:bg-appLayoutInputBackground focus:bg-appLayoutInputBackground transition-colors duration-100 rounded-md border border-appLayoutInverseHover`}
      ></input>
      <span className="icon-[material-symbols-light--search] h-actionBarButtonIconSize w-actionBarButtonIconSize absolute top-1/2 -translate-y-1/2 left-1"></span>
      <HoverListShell condition={isFocused}>
        <HoverListHeader>
          <span>
            {" "}
            {searchResults.length}{" "}
            {searchResults.length === 1 ? "result" : "results"} in your
            libraries
          </span>
          <span className="ml-auto text-appLayoutTextMuted text-actionBarResultDateFontSize">
            Last opened at
          </span>
        </HoverListHeader>
        <HoverListDivider />
        <HoverListBody>
          {searchResults.length > 0 &&
            searchResults
              .toSorted((a, b) => {
                if (!itemLocalStateManager.getLastOpened(a.id)) {
                  return false;
                } else if (!itemLocalStateManager.getLastOpened(b.id)) {
                  return true;
                } else {
                  return (
                    itemLocalStateManager.getLastOpened(b.id) -
                    itemLocalStateManager.getLastOpened(a.id)
                  );
                }
              })
              .map((result) => {
                const item_properties =
                  result.id === result.libraryId
                    ? dataManagerSubdocs
                        .getLibrary(result.libraryId)
                        .getMap("library_props")
                        .get("item_properties")
                    : dataManagerSubdocs
                        .getLibrary(result.libraryId)
                        .getMap("library_directory")
                        .get(result.id)
                        .get("value")
                        .get("item_properties");

                return (
                  <HoverListButton
                    key={result.id}
                    onClick={() => {
                      if (item_properties.item_title) {
                        setLibraryId(result.libraryId);
                        setItemId("unselected");
                        if (deviceType === "mobile") {
                          setPanelOpened(false);
                        }
                        setPanelOpened(true);

                        activatePanel("libraries", "details", [
                          result.libraryId,
                        ]);
                      }

                      if (
                        result.type === "book" ||
                        result.type === "paper" ||
                        result.type === "section"
                      ) {
                        itemLocalStateManager.setItemAndParentsOpened(
                          result.libraryId,
                          result.id
                        );

                        setLibraryId(result.libraryId);
                        setItemId(result.id);
                        setItemMode("details");
                        if (deviceType === "mobile") {
                          setPanelOpened(false);
                        }
                        setPanelOpened(true);
                      }
                      setActivity("libraries");

                      activatePanel("libraries", "details", [
                        result.libraryId,
                        result.id,
                      ]);
                    }}
                  >
                    <span> {item_properties.item_title}</span>
                    <span className="ml-auto text-appLayoutTextMuted text-actionBarResultDateFontSize">
                      {new Date(
                        itemLocalStateManager.getLastOpened(result.id)
                      ).toLocaleString()}
                    </span>
                  </HoverListButton>
                );
              })}

          {searchResults.length === 0 && (
            <HoverListItem disabled={true}>
              <div className="w-full h-full flex items-center">
                No results found
              </div>
            </HoverListItem>
          )}
        </HoverListBody>
        <HoverListDivider />
        <HoverListFooter />
      </HoverListShell>
    </div>
  );
};

export const ActionBarLeftSide = ({}) => {
  const zoom = appStore((state) => state.zoom);
  const isMd = appStore((state) => state.isMd);

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const sideBarOpened = appStore((state) => state.sideBarOpened);
  const setSideBarOpened = appStore((state) => state.setSideBarOpened);

  const { activatePanel } = useMainPanel();

  const [barWidth, setBarWidth] = useState(zoom * 240);

  useEffect(() => {
    const target = document.getElementById("ActivityBarAndSidePanelContainer");

    const syncWidths = () => {
      const targetWidth = target.offsetWidth;

      const copierWidth = max(zoom * 240, targetWidth);

      setBarWidth(copierWidth);
    };

    syncWidths();

    let ro = new ResizeObserver(() => {
      syncWidths();
    });

    ro.observe(target);

    return () => {
      ro.unobserve(target);
    };
  }, [zoom]);

  return (
    <div
      data-tauri-drag-region
      id="actionBarContainer"
      style={{
        width: isMd ? `${barWidth}px` : 0,
        minWidth: `calc(var(--uiScale) * 120px)`,
      }}
      className="border-b z-1000 border-appLayoutBorder h-full min-h-full text-appLayoutText font-sans"
    >
      <div
        data-tauri-drag-region
        id="actionBar"
        className="w-full h-full flex justify-start gap-1 items-center relative"
      >
        <div className="h-full w-fit flex items-center">
          <div
            style={{
              width: `calc(var(--activityBarWidth) - 1px)`,
            }}
            className="h-full flex items-center justify-center"
          >
            <ActionButton onClick={() => setSideBarOpened(!sideBarOpened)}>
              <div className="h-full w-actionBarButtonIconSize relative">
                <AnimatePresence mode="sync">
                  {sideBarOpened && (
                    <motion.span
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.05 }}
                      key="sideBarOpened"
                      className="icon-[tabler--layout-sidebar-left-collapse-filled] w-full h-full top-0 left-0 absolute bg-appLayoutTextMuted"
                    ></motion.span>
                  )}
                  {!sideBarOpened && (
                    <motion.span
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.05 }}
                      key="sideBarClosed"
                      className="icon-[tabler--layout-sidebar-left-expand] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                    ></motion.span>
                  )}
                </AnimatePresence>
              </div>
            </ActionButton>
          </div>

          <div className="w-px h-full py-2">
            <div className={`w-full h-full bg-appLayoutBorder`}></div>
          </div>
        </div>
        <ActionButton
          onClick={() => {}}
          className={`${false && "bg-appLayoutPressed"}`}
        >
          <div className={`h-full w-actionBarButtonIconSize relative`}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              key="searchButton"
              className="icon-[material-symbols-light--search] w-full h-full top-0 left-0 absolute bg-appLayoutText"
            ></motion.span>
          </div>
        </ActionButton>
        <div className="grow basis-0 min-w-0"></div>

        <div className="w-px min-w-px h-full py-2">
          <div className={`w-full h-full bg-appLayoutBorder`}></div>
        </div>
      </div>
    </div>
  );
};

export const ActionBarRightSide = ({}) => {
  const zoom = appStore((state) => state.zoom);
  const { deviceType } = useDeviceType();
  const appWindow = getCurrentWindow();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const { activatePanel } = useMainPanel();

  const [barWidth, setBarWidth] = useState(zoom * 240);

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const target = document.getElementById("NotesPanelContainer");

    const syncWidths = () => {
      const targetWidth = target.offsetWidth;

      const copierWidth = max(zoom * 240, targetWidth);

      setBarWidth(copierWidth);
    };

    syncWidths();

    let ro = new ResizeObserver(() => {
      syncWidths();
    });

    ro.observe(target);

    return () => {
      ro.unobserve(target);
    };
  }, [zoom]);

  useEffect(() => {
    const updateMaximized = async () => {
      const x = await getCurrentWindow().isMaximized();

      setIsMaximized(x);
    };

    const unlisten = getCurrentWindow().listen("tauri://resize", async () => {
      updateMaximized();
    });

    updateMaximized();

    return () => {
      unlisten.then((unlistenFn) => unlistenFn());
    };
  }, []);
  return (
    <div
      data-tauri-drag-region
      id="actionBarContainer"
      style={{
        width: `${barWidth}px`,
      }}
      className="border-b z-1000 border-appLayoutBorder h-actionBarHeight min-h-actionBarHeight text-appLayoutText font-sans"
    >
      <div
        data-tauri-drag-region
        id="actionBar"
        className="w-full h-full flex justify-end gap-1 items-center relative"
      >
        <div className="w-px min-w-px h-full py-2">
          <div className={`w-full h-full bg-appLayoutBorder`}></div>
        </div>
        <div className="grow"></div>
        <div className="h-full w-fit flex items-center gap-1">
          <div className="h-full w-fit pl-1 flex items-center gap-1">
            <ActionButton
              onClick={() => {
                activatePanel("settings", null, []);
              }}
              className={`${false && "bg-appLayoutPressed"}`}
            >
              <div className={`h-full w-actionBarButtonIconSize relative`}>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key="settingsButton"
                  className="icon-[material-symbols-light--settings] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                ></motion.span>
              </div>
            </ActionButton>
          </div>

          {deviceType !== "mobile" && (
            <>
              <WindowButton
                className={``}
                buttonContent={
                  <span className="icon-[fluent--minimize-16-regular] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize text-appLayoutTextMuted"></span>
                }
                onClick={() => {
                  appWindow.minimize();
                }}
              />
              <WindowButton
                className={``}
                buttonContent={
                  isMaximized ? (
                    <span className="icon-[clarity--window-restore-line] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize text-appLayoutTextMuted"></span>
                  ) : (
                    <span className="icon-[fluent--maximize-16-regular] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize text-appLayoutTextMuted"></span>
                  )
                }
                onClick={() => {
                  appWindow.toggleMaximize();
                }}
              />
              <WindowButton
                destructive={true}
                className={``}
                buttonContent={
                  <span className="icon-[material-symbols-light--close-rounded] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize text-appLayoutTextMuted"></span>
                }
                onClick={() => {
                  appWindow.close();
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
