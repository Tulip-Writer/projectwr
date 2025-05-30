import { getAuth } from "firebase/auth";
import { create } from "zustand";
import firebaseApp from "../lib/Firebase";

export const appStore = create((set) => ({
  loading: true,
  setLoading: (loading) => {
    return set({ loading: loading });
  },

  user: getAuth(firebaseApp).currentUser,
  setUser: (user) => {
    return set({ user: user });
  },

  panelOpened: false,
  setPanelOpened: (panelOpened) => {
    return set({ panelOpened: panelOpened });
  },

  panelTransient: false,
  setPanelTransient: (panelTransient) => {
    return set({ panelTransient: panelTransient });
  },

  showActivityBar: true,
  setShowActivityBar: (showActivityBar) => {
    return set({ showActivityBar: showActivityBar });
  },

  sideBarOpened: true,
  setSideBarOpened: (sideBarOpened) => {
    return set({ sideBarOpened: sideBarOpened });
  },

  zoom: 1,
  setZoom: (nextZoom) =>
    set((state) => ({
      zoom: typeof nextZoom === 'function' ? nextZoom(state.zoom) : nextZoom,
    })),
  activity: "home",
  setActivity: (activity) => {
    return set({ activity: activity });
  },

  libraryId: 'unselected',
  setLibraryId: (libraryId) => {
    return set({ libraryId: libraryId });
  },

  focusedItem: null,
  setFocusedItem: (focusedItem) => {
    return set({ focusedItem: focusedItem });
  },

  itemId: 'unselected',
  setItemId: (itemId) => {
    return set({ itemId: itemId });
  },

  itemMode: 'details',
  setItemMode: (itemMode) => {
    return set({ itemMode: itemMode });
  },

  templateId: 'unselected',
  setTemplateId: (templateId) => {
    return set({ templateId: templateId });
  },

  templateMode: 'details',
  setTemplateMode: (templateMode) => {
    return set({ templateMode: templateMode });
  },

  dictionaryWord: '',
  setDictionaryWord: (dictionaryWord) => {
    return set({ dictionaryWord: dictionaryWord });
  },

  dictionaryMode: '',
  setDictionaryMode: (dictionaryMode) => {
    return set({ dictionaryMode: dictionaryMode });
  },

  searchQuery: '',
  setSearchQuery: (searchQuery) => {
    return set({ searchQuery: searchQuery });
  },

  isMd: false,
  setIsMd: (isMd) => {
    return set({ isMd: isMd });
  },

  sidePanelWidth: 240,
  setSidePanelWidth: (sidePanelWidth) => {
    return set({ sidePanelWidth: sidePanelWidth })
  },

  notesPanelWidth: 284.8,
  setNotesPanelWidth: (notesPanelWidth) => {
    return set({ notesPanelWidth: notesPanelWidth })
  },

  notesPanelOpened: true,
  setNotesPanelOpened: (notesPanelOpened) => {
    return set({ notesPanelOpened: notesPanelOpened });
  },

  notesPanelState: { libraryId: null, itemId: null },
  setNotesPanelState: (notesPanelState) => {
    return set({ notesPanelState: notesPanelState });
  },

  proofreadContextItems: [],
  setProofreadContextItems: (proofreadContextItems) => {
    return (set({ proofreadContextItems: proofreadContextItems }));
  }
}));
