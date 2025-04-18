import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { checkForYTree, YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { appStore } from "../../stores/appStore";
import BookDetailsPanel from "../MainPanels/BookDetailsPanel";
import SectionDetailsPanel from "../MainPanels/SectionDetailsPanel";
import LibraryDetailsPanel from "../MainPanels/LibraryDetailsPanel";
import PaperPanel from "../MainPanels/PaperPanel";
import SettingsPanel from "../MainPanels/SettingsPanel";
import PaperSettingsPanel from "../MainPanels/PaperSettingsPanel";
import TemplateViewPanel from "../MainPanels/TemplateViewPanel";
import TemplateDetailsPanel from "../MainPanels/TemplateDetailsPanel";
import HomePanel from "../MainPanels/HomePanel";
import DictionaryCreatePanel from "../MainPanels/DictionaryCreatePanel";
import DictionaryDetailsPanel from "../MainPanels/DictionaryDetailsPanel";

const MainPanel = ({}) => {
  const { deviceType } = useDeviceType();

  const mainPanelPreviousRef = useRef(null);

  const libraryId = appStore((state) => state.libraryId);
  const itemId = appStore((state) => state.itemId);
  const itemMode = appStore((state) => state.itemMode);

  const templateId = appStore((state) => state.templateId);
  const templateMode = appStore((state) => state.templateMode);

  const dictionaryWord = appStore((state) => state.dictionaryWord);
  const dictionaryMode = appStore((state) => state.dictionaryMode);

  const setShowActivityBar = appStore((state) => state.setShowActivityBar);

  const activity = appStore((state) => state.activity);

  const key = useRef("empty");

  /** @type {{current: YTree}} */
  const libraryYTreeRef = useRef(null);

  useEffect(() => {
    if (libraryId === "unselected") {
      libraryYTreeRef.current = null;
      return;
    }

    if (
      !checkForYTree(
        dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory")
      )
    ) {
      throw new Error("Tried to access uninitialized directory");
    }

    libraryYTreeRef.current = new YTree(
      dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory")
    );
  }, [libraryId, activity, itemId, itemMode, templateId, templateMode]);

  const renderMainPanel = useCallback(() => {
    if (activity === "libraries") {
      if (libraryId !== "unselected") {
        if (itemId !== "unselected") {
          key.current = "itemDetails-" + itemId + "-" + itemMode;

          if (!libraryYTreeRef.current) {
            if (
              !checkForYTree(
                dataManagerSubdocs
                  .getLibrary(libraryId)
                  .getMap("library_directory")
              )
            ) {
              throw new Error("Tried to access uninitialized directory");
            }

            libraryYTreeRef.current = new YTree(
              dataManagerSubdocs
                .getLibrary(libraryId)
                .getMap("library_directory")
            );
          }

          const itemMap = libraryYTreeRef.current.getNodeValueFromKey(itemId);

          if (itemMap) {
            if (itemMap.get("type") === "book") {
              return (
                <BookDetailsPanel
                  ytree={libraryYTreeRef.current}
                  bookId={itemId}
                  key={itemId}
                />
              );
            }

            if (itemMap.get("type") === "section") {
              return (
                <SectionDetailsPanel
                  ytree={libraryYTreeRef.current}
                  sectionId={itemId}
                  key={itemId}
                />
              );
            }

            if (itemMap.get("type") === "paper") {
              if (itemMode === "details") {
                return (
                  <PaperPanel
                    ytree={libraryYTreeRef.current}
                    paperId={itemId}
                    key={itemId}
                  />
                );
              }

              if (itemMode === "settings") {
                return (
                  <PaperSettingsPanel
                    ytree={libraryYTreeRef.current}
                    paperId={itemId}
                  />
                );
              }
            }
          }
        }

        key.current = "libraryDetails-" + libraryId;
        return <LibraryDetailsPanel libraryId={libraryId} />;
      }

      // key.current = "empty";
      // return <HomePanel />;
    }

    if (activity === "templates") {
      if (templateId !== "unselected") {
        key.current = "templateDetails-" + templateId + "-" + templateMode;
        if (templateMode === "details") {
          return (
            <TemplateDetailsPanel templateId={templateId} key={templateId} />
          );
        }
        if (templateMode === "preview") {
          return <TemplateViewPanel templateId={templateId} key={templateId} />;
        }
      }

      // key.current = "empty";
      // return <HomePanel />;
    }

    if (activity === "dictionary") {
      if (dictionaryMode === "create") {
        key.current = "Dictionary-" + dictionaryMode;
        return <DictionaryCreatePanel />;
      }

      if (dictionaryMode === "details") {
        key.current = "Dictionary-" + dictionaryWord + "-" + dictionaryMode;
        return <DictionaryDetailsPanel word={dictionaryWord} />;
      }

      // key.current = "empty";
      // return <HomePanel />;
    }

    if (activity === "settings") {
      key.current = "settings";
      return <SettingsPanel />;
    }

    if (activity === "home") {
      key.current = "home";
      return <HomePanel />;
    }

    return null;
  }, [
    libraryId,
    activity,
    itemId,
    itemMode,
    templateId,
    templateMode,
    dictionaryMode,
    dictionaryWord,
  ]);

  const renderProxy = useCallback(() => {
    const mainPanel = renderMainPanel();
    
    if (mainPanel) {
      mainPanelPreviousRef.current = {key: key.current, mainPanel: mainPanel}
      return mainPanelPreviousRef.current.mainPanel;
    } else if (mainPanelPreviousRef.current) {
      return mainPanelPreviousRef.current.mainPanel;
    } else {
      return null;
    }
  }, [renderMainPanel])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key.current}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -10, opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="w-full h-full overflow-hidden z-3 flex justify-center"
      >
        {renderProxy()}
      </motion.div>
    </AnimatePresence>
  );
};

export default MainPanel;
