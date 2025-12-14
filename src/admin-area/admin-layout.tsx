import * as React from "react";
import styled from "@emotion/styled/macro";
import { Box, Flex, Button, HStack, VStack, Text } from "@chakra-ui/react";
import { AdminNavigation } from "./admin-navigation";
import { DashboardTab } from "./tabs/dashboard-tab";
import { MapsTab } from "./tabs/maps-tab";
import { TokensTab } from "./tabs/tokens-tab";
import { NotesTab } from "./tabs/notes-tab";

type AdminTabType = "dashboard" | "maps" | "tokens" | "notes";

// Burgundy & Tan Theme Colors - Matching DM interface aesthetic
const COLORS = {
  burgundy: "#8B3A3A",
  burgundyDark: "#5C2323",
  burgundyDarker: "#3D1D1D",
  tan: "#D4C4B9",
  tanLight: "#E8DCD2",
  tanDark: "#C4B4A9",
  gold: "#B8860B",
  darkBg: "#1A1515",
  contentBg: "#2A2420",
  textDark: "#3A3A3A",
  textLight: "#E8DCD2",
  textMuted: "#A89890",
  border: "#5C2323",
  accent: "#D4A574",
};

const AdminContainer = styled(VStack)`
  height: 100vh;
  width: 100vw;
  background-color: ${COLORS.darkBg};
  font-family: Georgia, serif;
  color: ${COLORS.textLight};
  spacing: 0;
`;

const Header = styled(Box)`
  background: linear-gradient(
    90deg,
    ${COLORS.burgundyDarker} 0%,
    ${COLORS.burgundy} 50%,
    ${COLORS.burgundyDarker} 100%
  );
  border-bottom: 3px solid ${COLORS.gold};
  padding: 24px 32px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const HeaderIcon = styled.div`
  font-size: 40px;
  line-height: 1;
`;

const HeaderTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HeaderTitle = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${COLORS.tanLight};
  text-transform: uppercase;
  letter-spacing: 3px;
  font-family: Georgia, serif;
`;

const HeaderSubtitle = styled.div`
  font-size: 13px;
  color: ${COLORS.gold};
  font-style: italic;
  letter-spacing: 1px;
  font-family: Georgia, serif;
`;

const MainLayout = styled(Flex)`
  flex: 1;
  width: 100%;
  overflow: hidden;
`;

const Sidebar = styled(VStack)`
  background-color: ${COLORS.contentBg};
  border-right: 2px solid ${COLORS.gold};
  width: 256px;
  padding: 20px 0;
  align-items: stretch;
  gap: 0;
  overflow-y: auto;
  box-shadow: inset -2px 0 8px rgba(0, 0, 0, 0.5);

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${COLORS.contentBg};
  }

  &::-webkit-scrollbar-thumb {
    background: ${COLORS.burgundy};
    border-radius: 4px;

    &:hover {
      background: ${COLORS.burgundyDark};
    }
  }
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
  padding: 32px 40px;
  background-color: ${COLORS.contentBg};

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: ${COLORS.contentBg};
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
    <AdminContainer spacing={0} align="stretch">
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderIcon>📖</HeaderIcon>
          <HeaderTextBlock>
            <HeaderTitle>Dungeon Revealer Map Manager</HeaderTitle>
            <HeaderSubtitle>Manage thy maps with arcane power</HeaderSubtitle>
          </HeaderTextBlock>
        </HeaderContent>
      </Header>

      {/* Main Content Area */}
      <MainLayout>
        {/* Sidebar Navigation */}
        <Sidebar>
          <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </Sidebar>

        {/* Content Area */}
        <ContentArea>
          <MainContent>{renderTabContent()}</MainContent>
        </ContentArea>
      </MainLayout>
    </AdminContainer>
  );
};
