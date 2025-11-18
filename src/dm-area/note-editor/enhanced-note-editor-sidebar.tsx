import * as React from "react";
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { NoteTemplatesPanel } from "./note-templates-panel";
import { NoteCategoriesPanel } from "./note-categories-panel";
import { NoteBacklinksPanel } from "./note-backlinks-panel";

interface EnhancedNoteEditorSidebarProps {
  mapId: string;
  currentNoteId?: string;
  onTemplateApply?: (templateId: string) => void;
  onCategorySelect?: (categoryId: string) => void;
  onLinkedNoteClick?: (noteId: string) => void;
}

/**
 * Enhanced note editor sidebar with templates, categories, and backlinks
 */
export const EnhancedNoteEditorSidebar: React.FC<EnhancedNoteEditorSidebarProps> =
  ({
    mapId,
    currentNoteId,
    onTemplateApply,
    onCategorySelect,
    onLinkedNoteClick,
  }) => {
    return (
      <Box h="full" overflowY="auto" borderLeftWidth="1px" bg="gray.50">
        <Tabs as={Box} orientation="vertical" size="sm" defaultIndex={0}>
          <TabList
            w="full"
            borderRightWidth="1px"
            overflowY="auto"
            maxH="20vh"
            bg="white"
            borderBottomWidth="1px"
            flexShrink={0}
          >
            <Tab>Templates</Tab>
            <Tab>Categories</Tab>
            {currentNoteId && <Tab>Links</Tab>}
          </TabList>

          <TabPanels overflowY="auto" flexGrow={1}>
            <TabPanel p={0}>
              <NoteTemplatesPanel
                mapId={mapId}
                onTemplateApply={onTemplateApply}
                currentNoteId={currentNoteId}
              />
            </TabPanel>

            <TabPanel p={0}>
              <NoteCategoriesPanel
                mapId={mapId}
                onCategorySelect={onCategorySelect}
              />
            </TabPanel>

            {currentNoteId && (
              <TabPanel p={0}>
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
