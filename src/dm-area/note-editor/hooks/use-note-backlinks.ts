import graphql from "babel-plugin-relay/macro";
import { useQuery } from "relay-hooks";
import { useNoteBacklinksToQuery } from "./__generated__/useNoteBacklinksToQuery.graphql";
import { useNoteBacklinksFromQuery } from "./__generated__/useNoteBacklinksFromQuery.graphql";

const BacklinksToQuery = graphql`
  query useNoteBacklinksToQuery($noteId: String!) {
    backlinksTo(noteId: $noteId) {
      id
      fromNoteId
      toNoteId
      linkText
    }
  }
`;

const BacklinksFromQuery = graphql`
  query useNoteBacklinksFromQuery($noteId: String!) {
    backlinksFrom(noteId: $noteId) {
      id
      fromNoteId
      toNoteId
      linkText
    }
  }
`;

/**
 * Hook to fetch backlinks (notes linking TO this note)
 */
export const useNoteBacklinksTo = (noteId: string) => {
  const result = useQuery<useNoteBacklinksToQuery>(BacklinksToQuery, {
    noteId,
  });
  return result;
};

/**
 * Hook to fetch forward links (notes this note links FROM)
 */
export const useNoteBacklinksFrom = (noteId: string) => {
  const result = useQuery<useNoteBacklinksFromQuery>(BacklinksFromQuery, {
    noteId,
  });
  return result;
};
