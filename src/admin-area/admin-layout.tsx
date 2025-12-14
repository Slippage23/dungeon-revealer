import * as React from "react";
import styled from "@emotion/styled/macro";
import { Box, Flex, Button, HStack, VStack, Text } from "@chakra-ui/react";
import { AdminNavigation } from "./admin-navigation";
import { DashboardTab } from "./tabs/dashboard-tab";
import { MapsTab } from "./tabs/maps-tab";
import { TokensTab } from "./tabs/tokens-tab";
import { NotesTab } from "./tabs/notes-tab";

type AdminTabType = "dashboard" | "maps" | "tokens" | "notes";

// Burgundy & Tan Theme Colors
const COLORS = {
  burgundy: "#8B3A3A",
  burgundyDark: "#5C2323",
  tan: "#D4C4B9",
  tanLight: "#E8DCD2",
  darkBg: "#2A2A2A",
  contentBg: "#3A3A3A",
  textDark: "#3A3A3A",
  textLight: "#E8DCD2",
  border: "#5C2323",
};

const AdminContainer = styled(Flex)`
  height: 100vh;
  background-color: ${COLORS.darkBg};
  font-family: Georgia, serif;
  color: ${COLORS.textLight};
`;

const Header = styled(Box)`
  background: linear-gradient(
    135deg,
    ${COLORS.burgundy} 0%,
    ${COLORS.burgundyDark} 100%
  );
  padding: 16px 24px;
  border-bottom: 2px solid ${COLORS.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: ${COLORS.tanLight};
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: Georgia, serif;
`;

const Sidebar = styled(VStack)`
  background-color: ${COLORS.contentBg};
  border-right: 2px solid ${COLORS.burgundy};
  width: 200px;
  padding: 16px 0;
  align-items: stretch;
  gap: 0;
`;

const ContentArea = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MainContent = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: ${COLORS.contentBg};

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${COLORS.darkBg};
  }

  &::-webkit-scrollbar-thumb {
    background: ${COLORS.burgundy};
    border-radius: 4px;

    &:hover {
      background: ${COLORS.burgundyDark};
    }
  }
`;

export const AdminLayout: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<AdminTabType>("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "maps":
        return <MapsTab />;
      case "tokens":
        return <TokensTab />;
      case "notes":
        return <NotesTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <AdminContainer>
      <VStack width="100%" spacing={0} align="stretch">
        {/* Header */}
        <Header>
          <HeaderTitle>Admin Panel</HeaderTitle>
          <Text fontSize="sm" color={COLORS.tanLight}>
            Server Management
          </Text>
        </Header>

        {/* Main Content Area */}
        <Flex flex="1" overflow="hidden">
          {/* Sidebar Navigation */}
          <Sidebar>
            <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </Sidebar>

          {/* Content Area */}
          <ContentArea>
            <MainContent>{renderTabContent()}</MainContent>
          </ContentArea>
        </Flex>
      </VStack>
    </AdminContainer>
  );
};
