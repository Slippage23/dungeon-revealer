import * as React from "react";
import styled from "@emotion/styled/macro";
import { Box, Flex, Button, HStack, VStack, Text } from "@chakra-ui/react";
import { buildUrl } from "../public-url";
import { AdminNavigation } from "./admin-navigation";
import { DashboardTab } from "./tabs/dashboard-tab";
import { MapsTab } from "./tabs/maps-tab";
import { TokensTab } from "./tabs/tokens-tab";
import { NotesTab } from "./tabs/notes-tab";

type AdminTabType = "dashboard" | "maps" | "tokens" | "notes";

// Manager-style color palette - warm tan/brown/cream theme
const COLORS = {
  // Dark background tones
  darkBg: "#1a1410", // Very dark brown-black
  contentBg: "#2a2218", // Dark warm brown

  // Sidebar and navigation
  sidebarBg: "#2a2218", // Dark warm brown

  // Tan/cream content panels
  panelBg: "#d4c4a8", // Warm tan/parchment
  panelBorder: "#a89878", // Darker tan border
  panelHeaderBg: "#c8b898", // Slightly darker tan for headers

  // Text colors
  textDark: "#3a3020", // Dark brown text
  textLight: "#e8dcc8", // Light cream text
  textMuted: "#a89878", // Muted tan text
  textGold: "#c8a858", // Golden accent text

  // Header/accent colors
  headerBg: "#3a3020", // Dark brown header
  gold: "#c8a858", // Golden accents

  // Button colors - matching manager style
  buttonGreen: "#4a7848", // Muted forest green
  buttonGreenHover: "#5a8858", // Lighter green on hover
  buttonTan: "#c8b898", // Tan button
  buttonTanHover: "#d8c8a8", // Lighter tan on hover
  buttonRed: "#8b4848", // Muted red
  buttonRedHover: "#9b5858", // Lighter red on hover

  // Category headers
  categoryText: "#c8a858", // Golden category labels

  // Legacy names for compatibility
  burgundy: "#6a4a38",
  burgundyDark: "#4a3428",
  burgundyDarker: "#3a2820",
  tan: "#d4c4a8",
  tanLight: "#e8dcc8",
  tanDark: "#c8b898",
  border: "#a89878",
  accent: "#c8a858",
};

const AdminContainer = styled(VStack)`
  height: 100vh;
  width: 100vw;
  background-color: ${COLORS.darkBg};
  font-family: Georgia, "Times New Roman", serif;
  font-size: 15px;
  color: ${COLORS.textLight};
  spacing: 0;
`;

const Header = styled(Box)`
  background: linear-gradient(
    90deg,
    ${COLORS.headerBg} 0%,
    #4a3828 50%,
    ${COLORS.headerBg} 100%
  );
  border-bottom: 2px solid ${COLORS.gold};
  padding: 20px 32px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const HeaderIcon = styled.div`
  width: 56px;
  height: 56px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const HeaderTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HeaderTitle = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: ${COLORS.tanLight};
  text-transform: uppercase;
  letter-spacing: 3px;
  font-family: folkard, Georgia, serif;
`;

const HeaderSubtitle = styled.div`
  font-size: 14px;
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
  background-color: ${COLORS.sidebarBg};
  border-right: 1px solid ${COLORS.gold};
  width: 240px;
  padding: 16px 0;
  align-items: stretch;
  gap: 0;
  overflow-y: auto;
  box-shadow: inset -2px 0 8px rgba(0, 0, 0, 0.3);

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${COLORS.sidebarBg};
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
  padding: 24px 32px;
  background: linear-gradient(180deg, #faf4e8 0%, #f0e4d0 100%);

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #f0e4d0;
  }

  &::-webkit-scrollbar-thumb {
    background: ${COLORS.burgundy};
    border-radius: 4px;

    &:hover {
      background: ${COLORS.burgundyDark};
    }
  }
`;

const Footer = styled(Box)`
  background-color: ${COLORS.headerBg};
  border-top: 1px solid ${COLORS.gold};
  padding: 12px 24px;
  display: flex;
  justify-content: center;
  gap: 32px;
`;

const FooterLink = styled.a`
  color: ${COLORS.gold};
  font-family: Georgia, serif;
  font-size: 15px;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${COLORS.tanLight};
    text-decoration: underline;
  }
`;

export const AdminLayout: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<AdminTabType>("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab onNavigate={setActiveTab} />;
      case "maps":
        return <MapsTab />;
      case "tokens":
        return <TokensTab />;
      case "notes":
        return <NotesTab />;
      default:
        return <DashboardTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <AdminContainer spacing={0} align="stretch">
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderIcon>
            <img src={buildUrl("/images/icons/heading_icon.png")} alt="logo" />
          </HeaderIcon>
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

      {/* Footer with navigation links */}
      <Footer>
        <FooterLink href="/">Visit Player Section &gt;</FooterLink>
        <FooterLink href="/dm">Visit DM Section &gt;</FooterLink>
      </Footer>
    </AdminContainer>
  );
};
