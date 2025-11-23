import * as React from "react";
import { VStack, useDisclosure } from "@chakra-ui/react";
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
  console.log("[NoteTemplatesPanel] Rendering with mapId:", mapId);
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
      <VStack spacing={3} align="stretch" w="full">
        <NoteTemplateList
          key={`templates-${refreshKey}`}
          mapId={mapId}
          onTemplateSelect={onTemplateApply}
          onCreateClick={onCreateModalOpen}
        />
      </VStack>

      <NoteTemplateCreateModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        mapId={mapId}
        onSuccess={handleTemplateCreated}
      />
    </>
  );
};
