import * as React from "react";
import styled from "@emotion/styled/macro";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  Input,
  Table,
  Tbody,
  Tr,
  Td,
  Thead,
  Th,
  TableContainer,
} from "@chakra-ui/react";
import graphql from "babel-plugin-relay/macro";
import { useQuery } from "relay-hooks";
import { notesTab_NotesQuery } from "./__generated__/notesTab_NotesQuery.graphql";

const COLORS = {
  burgundy: "#8B3A3A",
  burgundyDark: "#5C2323",
  tan: "#D4C4B9",
  tanLight: "#E8DCD2",
  contentBg: "#3A3A3A",
  textLight: "#E8DCD2",
  border: "#5C2323",
};

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: ${COLORS.tanLight};
  margin-bottom: 24px;
  font-family: Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const ActionBar = styled(HStack)`
  background-color: #454545;
  border: 1px solid ${COLORS.burgundy};
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 24px;
`;

const UploadButton = styled(Button)`
  background-color: ${COLORS.burgundy} !important;
  color: ${COLORS.tanLight} !important;
  border: 1px solid ${COLORS.tan} !important;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;

  &:hover {
    background-color: ${COLORS.burgundyDark} !important;
  }
`;

const StyledTable = styled(TableContainer)`
  border: 1px solid ${COLORS.burgundy};
  border-radius: 4px;
  overflow: hidden;

  table {
    background-color: #454545;
  }

  thead {
    background-color: ${COLORS.burgundy};
  }

  th {
    color: ${COLORS.tanLight};
    border-color: ${COLORS.border};
    font-family: Georgia, serif;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 12px;
  }

  td {
    color: ${COLORS.textLight};
    border-color: ${COLORS.border};
    font-size: 13px;
  }

  tbody tr:hover {
    background-color: #505050;
  }
`;

const notesQuery = graphql`
  query notesTab_NotesQuery($first: Int, $after: String) {
    notes(first: $first, after: $after, filter: All) {
      edges {
        node {
          id
          title
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const NotesTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const { data, isLoading, error } = useQuery<notesTab_NotesQuery>(notesQuery, {
    first: 50,
  });

  const notes = data?.notes?.edges?.map((edge) => edge.node) || [];
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Center height="300px">
        <Spinner size="xl" color={COLORS.tan} />
      </Center>
    );
  }

  if (error) {
    return (
      <Box color="red.400" p={6}>
        <Text>Error loading notes: {error.message}</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <PageTitle>📝 Notes & Monsters</PageTitle>
        <Text color={COLORS.textLight} fontSize="14px">
          Import monsters from Excel, manage shared resource notes
        </Text>
      </Box>

      {/* Action Bar */}
      <ActionBar justifyContent="space-between" width="100%">
        <Input
          placeholder="Search notes by title..."
          bg={COLORS.contentBg}
          borderColor={COLORS.burgundy}
          color={COLORS.textLight}
          size="sm"
          width="300px"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          _placeholder={{ color: COLORS.textLight, opacity: 0.5 }}
        />

        <HStack spacing={2}>
          <UploadButton size="sm">📊 Import Excel</UploadButton>
        </HStack>
      </ActionBar>

      {/* Notes Table */}
      {filteredNotes.length === 0 ? (
        <Center p={12}>
          <VStack spacing={4}>
            <Text fontSize="18px" color={COLORS.textLight}>
              {searchTerm ? "No notes match your search" : "No notes yet"}
            </Text>
            <Text fontSize="12px" color={COLORS.textLight} opacity={0.6}>
              Import monsters from an Excel file to get started
            </Text>
          </VStack>
        </Center>
      ) : (
        <StyledTable>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredNotes.map((note) => (
                <Tr key={note.id}>
                  <Td maxW="300px" isTruncated>
                    {note.title}
                  </Td>
                  <Td>
                    {new Date(parseInt(note.createdAt)).toLocaleDateString()}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button size="xs" variant="outline" fontSize="11px">
                        View
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        fontSize="11px"
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </StyledTable>
      )}

      {/* Import Guide */}
      <Box
        bg={COLORS.contentBg}
        border={`1px solid ${COLORS.burgundy}`}
        borderRadius="4px"
        p={6}
        mt={8}
      >
        <Text
          fontSize="16px"
          fontWeight="bold"
          color={COLORS.tan}
          mb={4}
          fontFamily="Georgia, serif"
          textTransform="uppercase"
          letterSpacing="1px"
        >
          📖 Import Guide
        </Text>
        <VStack
          align="start"
          spacing={3}
          fontSize="13px"
          color={COLORS.textLight}
        >
          <Text>
            <strong>Excel Format:</strong> Your file should have columns like
            Name, AC, HP, etc.
          </Text>
          <Text>
            <strong>Fuzzy Matching:</strong> Monster names are matched against
            available tokens
          </Text>
          <Text>
            <strong>Linking:</strong> Matched tokens are automatically linked to
            created notes
          </Text>
          <Text>
            <strong>Batch Import:</strong> Upload multiple monsters at once with
            progress tracking
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
};
