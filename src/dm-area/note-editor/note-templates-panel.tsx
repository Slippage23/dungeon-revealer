import * as React from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
} from "@chakra-ui/react";
import * as Icon from "../../feather-icons";
import { NoteTemplateList } from "./note-template-list";
import { NoteTemplateCreateModal } from "./note-template-create-modal";
import type { NoteTemplate } from "./note-template-list";

interface NoteTemplatesPanelProps {
  mapId: string;
  onTemplateApply?: (template: NoteTemplate) => void;
  currentNoteId?: string;
}

/**
 * Integrated panel for viewing and managing note templates
 * Can be placed in the sidebar or as a separate section
 */
export const NoteTemplatesPanel: React.FC<NoteTemplatesPanelProps> = ({
  mapId,
  onTemplateApply,
  currentNoteId,
}) => {
  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure();

  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleTemplateCreated = () => {
    // Force refresh of the template list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Box p={3} borderTopWidth="1px">
        <Tabs variant="soft-rounded" size="sm">
          <TabList mb={2}>
            <Tab>Templates</Tab>
            <Tab>Manage</Tab>
          </TabList>

          <TabPanels>
            {/* Templates Tab - Quick access to apply templates */}
            <TabPanel p={0}>
              <NoteTemplateList
                key={`templates-${refreshKey}`}
                mapId={mapId}
                onTemplateSelect={onTemplateApply}
                onCreateClick={onCreateModalOpen}
              />
            </TabPanel>

            {/* Manage Tab - Create and delete templates */}
            <TabPanel p={0}>
              <VStack spacing={3}>
                <Button
                  w="100%"
                  leftIcon={<Icon.Plus size={16} />}
                  onClick={onCreateModalOpen}
                  colorScheme="blue"
                  size="sm"
                >
                  Create New Template
                </Button>

                <Divider />

                <Text fontSize="xs" color="gray.600">
                  Templates allow you to create reusable note structures. Define
                  fields once and quickly create standardized notes.
                </Text>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <NoteTemplateCreateModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        mapId={mapId}
        onSuccess={handleTemplateCreated}
      />
    </>
  );
};
