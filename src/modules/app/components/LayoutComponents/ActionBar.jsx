import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { appStore } from "../../stores/appStore";
import { motion, AnimatePresence } from "motion/react";
import { queryData } from "../../lib/search";
import { useEffect, useRef, useState } from "react";
import itemLocalStateManager from "../../lib/itemLocalState";
import { max } from "lib0/math";
import useStoreHistory from "../../hooks/useStoreHistory";

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

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const unlisten = getCurrentWindow().listen("tauri://resize", async () => {
      const x = await getCurrentWindow().isMaximized();
      console.log("fullscreen??", x);

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
      className="border-b z-[1000] border-appLayoutBorder w-full h-actionBarHeight min-h-actionBarHeight text-appLayoutText font-sans"
    >
      <div
        data-tauri-drag-region
        id="actionBar"
        className="w-full h-full flex justify-start items-center relative"
      >
        <div className="h-full w-fit pl-1 flex items-center gap-1">
          <Logo>
            <div className="h-actionBarLogoSize w-actionBarLogoSize p-px relative">
              <span
                key="logoButtonDisabled"
                className="icon-[ph--flower-tulip-thin] w-full h-full top-0 left-0 absolute  bg-appLayoutText"
              ></span>
            </div>
          </Logo>

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

        {/* 
        <div
          className={`logo h-full w-actionBarLogoSize flex items-center justify-center font-serif pointer-events-none select-none`}
        >
          <span className="icon-[ph--flower-tulip-thin] h-actionBarLogoSize w-actionBarLogoSize"></span>
        </div> */}

        {/* <ActionButton
          onClick={async () => {
            console.log(await queryData("Untitled"));
          }}
        >
          <span className="icon-[material-symbols-light--search] h-actionBarButtonIconSize w-actionBarButtonIconSize"></span>
        </ActionButton> */}

        <div className="absolute h-full w-fit top-0 left-1/2 -translate-x-1/2">
          <SearchBar />
        </div>

        <div className="flex-grow"></div>

        {/* <ActionButton>
          <span className="icon-[line-md--question] h-actionBarButtonIconSize w-actionBarButtonIconSize"></span>
        </ActionButton> */}

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
  );
};

export default ActionBar;

const Logo = ({ children }) => {
  return (
    <div className="h-full w-fit">
      <div
        className={`h-full w-fitrounded-md flex items-center justify-center`}
      >
        {children}
      </div>
    </div>
  );
};

const ActionButton = ({ onClick, className, children, disabled = false }) => {
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
      className={`h-full flex items-center justify-center w-fit px-4 text-appLayoutHighlight ${
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

  const searchQuery = appStore((state => state.searchQuery));
  const setSearchQuery = appStore((state => state.setSearchQuery));

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

  console.log(
    "Sroted results: ",
    searchResults.toSorted((a, b) => {
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
  );

  return (
    <div className="relative h-full py-1 w-actionBarSearchWidth ml-1 text-actionBarSearchTextSize">
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
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute top-[100%] pt-1 px-1 h-fit w-full bg-appBackground rounded-md z-[1000] border border-appLayoutInverseHover overflow-hidden shadow-2xl shadow-appLayoutGentleShadow flex items-center flex-col"
          >
            <div
              style={{
                paddingLeft: `var(--scrollbarWidth)`,
                paddingRight: `var(--scrollbarWidth)`,
              }}
              className="w-full h-actionBarSearchHeaderHeight text-actionBarResultHeaderTextSize text-appLayoutTextMuted flex items-center"
            >
              <span>
                {" "}
                {searchResults.length}{" "}
                {searchResults.length === 1 ? "result" : "results"} in your
                libraries
              </span>
              <span className="ml-auto text-appLayoutTextMuted text-actionBarResultDateFontSize">
                Last opened at
              </span>
            </div>
            <div className="w-[98.5%] h-px flex-shrink-0 bg-appLayoutBorder"></div>
            <div
              style={{
                paddingLeft: `var(--scrollbarWidth)`,
              }}
              className="w-full max-h-actionBarSearchMaxHeight overflow-y-scroll text-actionBarResultTextSize flex flex-col py-1"
            >
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
                    return (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={result.id}
                        onClick={() => {
                          if (result.library_name) {
                            setLibraryId(result.libraryId);
                            setItemId("unselected");
                            if (deviceType === "mobile") {
                              setPanelOpened(false);
                            }
                            setPanelOpened(true);
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
                            console.log(
                              "Opening from search: ",
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
                        }}
                        style={{
                          paddingTop: `var(--scrollbarWidth)`,
                          paddingBottom: `var(--scrollbarWidth)`,
                        }}
                        className="px-3 h-actionBarResultNodeHeight w-full flex items-center hover:bg-appLayoutInverseHover rounded-md "
                      >
                        <span> {result.library_name || result.item_title}</span>
                        <span className="ml-auto text-appLayoutTextMuted text-actionBarResultDateFontSize">
                          {new Date(
                            itemLocalStateManager.getLastOpened(result.id)
                          ).toLocaleString()}
                        </span>
                      </motion.button>
                    );
                  })}

              {searchResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="noResults"
                  style={{
                    paddingTop: `var(--scrollbarWidth)`,
                    paddingBottom: `var(--scrollbarWidth)`,
                  }}
                  className="px-1 h-actionBarResultNodeHeight flex items-center justify-center text-appLayoutTextMuted"
                >
                  No results found
                </motion.div>
              )}
            </div>
            <div className="w-[98.5%] h-px flex-shrink-0 bg-appLayoutBorder"></div>

            <div className="w-full px-2 h-actionBarSearchFooterHeight text-actionBarResultHeaderTextSize flex items-center"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
