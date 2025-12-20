import * as React from "react";
import styled from "@emotion/styled/macro";
import { VStack, Button, Icon, Divider } from "@chakra-ui/react";

type AdminTabType = "dashboard" | "maps" | "tokens" | "notes";

interface AdminNavigationProps {
  activeTab: AdminTabType;
  onTabChange: (tab: AdminTabType) => void;
}

const COLORS = {
  // Manager-style color palette
  darkBg: "#1a1410",
  sidebarBg: "#2a2218",

  // Tan/cream tones
  tan: "#d4c4a8",
  tanLight: "#e8dcc8",
  tanDark: "#c8b898",

  // Text colors
  textLight: "#e8dcc8",
  textMuted: "#a89878",
  textGold: "#c8a858",

  // Button colors matching manager
  buttonTan: "#c8b898",
  buttonTanHover: "#d8c8a8",
  buttonGreen: "#4a7848",
  buttonGreenHover: "#5a8858",
  buttonRed: "#8b4848",
  buttonRedHover: "#9b5858",

  // Accents
  gold: "#c8a858",
  burgundy: "#6a4a38",
  burgundyDark: "#4a3428",
  burgundyDarker: "#3a2820",
  accent: "#c8a858",
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
  font-size: 13px;
  font-weight: bold;
  color: ${COLORS.textGold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 12px 16px 6px 16px;
  font-family: folkard, Georgia, serif;
`;

const NavDivider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    ${COLORS.gold}40,
    transparent
  );
  margin: 8px 0;
  width: 100%;
`;

const NavButton = styled(Button)<{
  isActive: boolean;
  buttonColor?: "tan" | "green" | "red";
}>`
  width: calc(100% - 16px);
  background-color: ${(props) => {
    if (props.isActive) {
      switch (props.buttonColor) {
        case "green":
          return COLORS.buttonGreen;
        case "red":
          return COLORS.buttonRed;
        default:
          return COLORS.buttonTan;
      }
    }
    switch (props.buttonColor) {
      case "green":
        return COLORS.buttonGreen;
      case "red":
        return COLORS.buttonRed;
      default:
        return COLORS.buttonTan;
    }
  }};
  color: ${(props) => {
    if (props.buttonColor === "green" || props.buttonColor === "red") {
      return COLORS.tanLight;
    }
    return COLORS.burgundyDarker;
  }};
  border: 1px solid
    ${(props) => (props.isActive ? COLORS.gold : "rgba(0,0,0,0.2)")};
  border-radius: 3px;
  text-align: left;
  padding: 12px 14px;
  margin: 2px 8px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 14px;
  letter-spacing: 0.5px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: ${(props) =>
    props.isActive
      ? "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.3)"
      : "0 2px 4px rgba(0,0,0,0.2)"};

  &:hover {
    background-color: ${(props) => {
      switch (props.buttonColor) {
        case "green":
          return COLORS.buttonGreenHover;
        case "red":
          return COLORS.buttonRedHover;
        default:
          return COLORS.buttonTanHover;
      }
    }};
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${COLORS.gold};
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
  buttonColor?: "tan" | "green" | "red";
}> = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
    section: "navigation",
    buttonColor: "tan",
  },
  {
    id: "maps",
    label: "List Maps",
    icon: "�",
    section: "maps",
    buttonColor: "tan",
  },
  {
    id: "tokens",
    label: "List Tokens",
    icon: "🎯",
    section: "token-management",
    buttonColor: "tan",
  },
  {
    id: "notes",
    label: "Import Monster Notes",
    icon: "�",
    section: "note-import",
    buttonColor: "tan",
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
      {/* All Navigation Items */}
      <NavSection>
        <NavSectionTitle>Navigation</NavSectionTitle>
        {tabs.map((tab) => (
          <NavButton
            key={tab.id}
            isActive={activeTab === tab.id}
            buttonColor={tab.buttonColor}
            onClick={() => onTabChange(tab.id)}
            _focus={{ outline: "none" }}
          >
            <TabIcon>{tab.icon}</TabIcon>
            <TabLabel>{tab.label}</TabLabel>
          </NavButton>
        ))}
      </NavSection>
    </NavigationContainer>
  );
};
