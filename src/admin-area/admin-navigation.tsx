import * as React from "react";
import styled from "@emotion/styled/macro";
import { VStack, Button, Icon, Divider } from "@chakra-ui/react";

type AdminTabType = "dashboard" | "maps" | "tokens" | "notes";

interface AdminNavigationProps {
  activeTab: AdminTabType;
  onTabChange: (tab: AdminTabType) => void;
}

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
  textLight: "#E8DCD2",
  textMuted: "#A89890",
  accent: "#D4A574",
};

const NavigationContainer = styled(VStack)`
  width: 100%;
  spacing: 0;
  align-items: stretch;
`;

const NavSection = styled(VStack)`
  width: 100%;
  spacing: 0;
  align-items: stretch;
`;

const NavSectionTitle = styled.div`
  font-size: 11px;
  font-weight: bold;
  color: ${COLORS.gold};
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 16px 16px 8px 16px;
  font-family: Georgia, serif;
`;

const NavDivider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    ${COLORS.burgundy},
    transparent
  );
  margin: 12px 0;
  width: 100%;
`;

const NavButton = styled(Button)<{ isActive: boolean }>`
  width: 100%;
  background-color: ${(props) =>
    props.isActive ? COLORS.burgundy : "transparent"};
  color: ${(props) => (props.isActive ? COLORS.tanLight : COLORS.textLight)};
  border: 1px solid ${(props) => (props.isActive ? COLORS.gold : "transparent")};
  border-left: 4px solid
    ${(props) => (props.isActive ? COLORS.gold : "transparent")};
  border-radius: 2px;
  text-align: left;
  padding: 12px 16px;
  margin: 0 8px;
  font-family: Georgia, serif;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${(props) => (props.isActive ? "bold" : "normal")};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    background-color: ${(props) =>
      props.isActive ? COLORS.burgundyDark : COLORS.burgundyDarker};
    border-left-color: ${COLORS.gold};
    color: ${COLORS.tanLight};
  }

  &:active {
    transform: scale(0.98);
  }

  &:not(:last-child) {
    margin-bottom: 4px;
  }

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 2px ${COLORS.gold};
  }
`;

const TabIcon = styled.span`
  display: inline-block;
  width: 20px;
  text-align: center;
  font-size: 16px;
  flex-shrink: 0;
`;

const TabLabel = styled.span`
  font-size: 12px;
  flex: 1;
`;

const tabs: Array<{
  id: AdminTabType;
  label: string;
  icon: string;
  section: string;
}> = [
  { id: "dashboard", label: "Dashboard", icon: "📊", section: "navigation" },
  { id: "maps", label: "List Maps", icon: "🗺️", section: "maps" },
  {
    id: "tokens",
    label: "List Tokens",
    icon: "🎯",
    section: "token-management",
  },
  {
    id: "notes",
    label: "Import Monster Notes",
    icon: "📝",
    section: "note-import",
  },
];

const groupedTabs = {
  navigation: tabs.filter((t) => t.section === "navigation"),
  maps: tabs.filter((t) => t.section === "maps"),
  tokenManagement: tabs.filter((t) => t.section === "token-management"),
  noteImport: tabs.filter((t) => t.section === "note-import"),
};

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <NavigationContainer>
      {/* Dashboard / Statistics Section */}
      <NavSection>
        <NavSectionTitle>Overview</NavSectionTitle>
        {groupedTabs.navigation.map((tab) => (
          <NavButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            _focus={{ outline: "none" }}
            _active={{ bg: COLORS.burgundy }}
          >
            <TabIcon>{tab.icon}</TabIcon>
            <TabLabel>{tab.label}</TabLabel>
          </NavButton>
        ))}
        <NavDivider />
      </NavSection>

      {/* Maps Section */}
      <NavSection>
        <NavSectionTitle>Maps</NavSectionTitle>
        {groupedTabs.maps.map((tab) => (
          <NavButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            _focus={{ outline: "none" }}
            _active={{ bg: COLORS.burgundy }}
          >
            <TabIcon>{tab.icon}</TabIcon>
            <TabLabel>{tab.label}</TabLabel>
          </NavButton>
        ))}
        <NavDivider />
      </NavSection>

      {/* Token Management Section */}
      <NavSection>
        <NavSectionTitle>Token Management</NavSectionTitle>
        {groupedTabs.tokenManagement.map((tab) => (
          <NavButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            _focus={{ outline: "none" }}
            _active={{ bg: COLORS.burgundy }}
          >
            <TabIcon>{tab.icon}</TabIcon>
            <TabLabel>{tab.label}</TabLabel>
          </NavButton>
        ))}
        <NavDivider />
      </NavSection>

      {/* Note Import Section */}
      <NavSection>
        <NavSectionTitle>Note Import</NavSectionTitle>
        {groupedTabs.noteImport.map((tab) => (
          <NavButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            _focus={{ outline: "none" }}
            _active={{ bg: COLORS.burgundy }}
          >
            <TabIcon>{tab.icon}</TabIcon>
            <TabLabel>{tab.label}</TabLabel>
          </NavButton>
        ))}
        <NavDivider />
      </NavSection>

      {/* Settings Section */}
      <NavSection style={{ marginTop: "auto" }}>
        <NavSectionTitle>Settings</NavSectionTitle>
        <NavButton
          isActive={false}
          onClick={() => {}}
          _focus={{ outline: "none" }}
          opacity={0.6}
          cursor="not-allowed"
        >
          <TabIcon>⚙️</TabIcon>
          <TabLabel>Configuration</TabLabel>
        </NavButton>
      </NavSection>
    </NavigationContainer>
  );
};
