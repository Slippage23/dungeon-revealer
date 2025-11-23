import * as React from "react";
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { NoteTemplatesPanel } from "./note-templates-panel";
import { NoteCategoriesPanel } from "./note-categories-panel";
import { NoteBacklinksPanel } from "./note-backlinks-panel";
import { useCurrentMapId } from "./map-context";
import type { NoteTemplate } from "./note-template-list";

interface EnhancedNoteEditorSidebarProps {
  mapId?: string;
  currentNoteId?: string;
  onTemplateApply?: (template: NoteTemplate) => void;
  onCategorySelect?: (categoryId: string) => void;
  onLinkedNoteClick?: (noteId: string) => void;
}

/**
 * Enhanced note editor sidebar with templates, categories, and backlinks
 */
export const EnhancedNoteEditorSidebar: React.FC<EnhancedNoteEditorSidebarProps> =
  ({
    mapId: propMapId,
    currentNoteId,
    onTemplateApply,
    onCategorySelect,
    onLinkedNoteClick,
  }) => {
    console.log("[SIDEBAR DEBUG] Component rendering!");
    // Use provided mapId or fallback to context
    const contextMapId = useCurrentMapId();
    const mapId = propMapId || contextMapId;

    console.log("[EnhancedNoteEditorSidebar] Got mapId:", {
      propMapId,
      contextMapId,
      mapId,
      currentNoteId,
    });

    // Cannot render without mapId
    if (!mapId) {
      return <Box p={2}>Loading... (no mapId)</Box>;
    }

    return (
      <Box
        h="full"
        display="flex"
        flexDirection="column"
        borderLeftWidth="1px"
        bg="gray.50"
      >
        <Tabs
          as={Box}
          size="sm"
          defaultIndex={0}
          display="flex"
          flexDirection="column"
          h="full"
        >
          <TabList borderBottomWidth="1px" flexShrink={0} bg="white">
            <Tab>Templates</Tab>
            <Tab>Categories</Tab>
            {currentNoteId && <Tab>Links</Tab>}
          </TabList>

          <TabPanels overflowY="auto" flexGrow={1} display="flex" h="0">
            <TabPanel p={2} w="full" overflowY="auto">
              <NoteTemplatesPanel
                mapId={mapId}
                onTemplateApply={onTemplateApply}
                currentNoteId={currentNoteId}
              />
            </TabPanel>

            <TabPanel p={2} w="full" overflowY="auto">
              <NoteCategoriesPanel
                mapId={mapId}
                onCategorySelect={onCategorySelect}
              />
            </TabPanel>

            {currentNoteId && (
              <TabPanel p={2} w="full" overflowY="auto">
                <NoteBacklinksPanel
                  noteId={currentNoteId}
                  onLinkClick={onLinkedNoteClick}
                />
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
    );
  };
