import * as React from "react";
import styled from "@emotion/styled/macro";
import { VStack, Button, Icon } from "@chakra-ui/react";

type AdminTabType = "dashboard" | "maps" | "tokens" | "notes";

interface AdminNavigationProps {
  activeTab: AdminTabType;
  onTabChange: (tab: AdminTabType) => void;
}

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

const NavButton = styled(Button)<{ isActive: boolean }>`
  width: 100%;
  background-color: ${(props) =>
    props.isActive ? COLORS.burgundy : "transparent"};
  color: ${(props) => (props.isActive ? COLORS.tanLight : COLORS.textLight)};
  border: none;
  border-left: 3px solid
    ${(props) => (props.isActive ? COLORS.tan : "transparent")};
  border-radius: 0;
  text-align: left;
  padding: 12px 16px;
  font-family: Georgia, serif;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${(props) => (props.isActive ? "bold" : "normal")};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.isActive ? COLORS.burgundyDark : COLORS.contentBg};
    border-left-color: ${COLORS.tan};
  }

  &:not(:last-child) {
    margin-bottom: 0;
  }
`;

const TabIcon = styled.span`
  margin-right: 12px;
  display: inline-block;
  width: 16px;
  text-align: center;
`;

const TabLabel = styled.span`
  font-size: 13px;
`;

const tabs: Array<{ id: AdminTabType; label: string; icon: string }> = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "maps", label: "Maps", icon: "🗺️" },
  { id: "tokens", label: "Tokens", icon: "🎯" },
  { id: "notes", label: "Notes", icon: "📝" },
];

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <VStack width="100%" spacing={0} align="stretch">
      {tabs.map((tab) => (
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
    </VStack>
  );
};
