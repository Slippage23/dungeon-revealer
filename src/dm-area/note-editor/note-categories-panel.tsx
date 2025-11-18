import * as React from "react";
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useDisclosure,
} from "@chakra-ui/react";
import { NoteCategoryTreeView } from "./note-category-tree-view";
import { NoteCategoryCreateModal } from "./note-category-create-modal";

interface NoteCategoriesPanelProps {
  mapId: string;
  onCategorySelect?: (categoryId: string) => void;
}

/**
 * Panel for managing note categories with tree view and creation
 */
export const NoteCategoriesPanel: React.FC<NoteCategoriesPanelProps> = ({
  mapId,
  onCategorySelect,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleCategoryCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <Tabs as={Box}>
        <TabList>
          <Tab>Categories</Tab>
          <Tab>Manage</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <NoteCategoryTreeView
              key={refreshKey}
              mapId={mapId}
              onCategorySelect={onCategorySelect}
              onCreateClick={onOpen}
            />
          </TabPanel>

          <TabPanel>
            <Box py={4}>
              <NoteCategoryCreateModal
                isOpen={isOpen}
                onClose={onClose}
                mapId={mapId}
                onSuccess={handleCategoryCreated}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
