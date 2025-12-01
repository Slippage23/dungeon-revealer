import graphql from "babel-plugin-relay/macro";
import { useMutation } from "relay-hooks";
import { resetMapMutation } from "./__generated__/resetMapMutation.graphql";

export const ResetMapMutation = graphql`
  mutation resetMapMutation($input: MapTokenRemoveManyInput!) {
    mapTokenRemoveMany(input: $input)
  }
`;

export const useResetMap = () => {
  const [mutate] = useMutation<resetMapMutation>(ResetMapMutation);
  return (mapId: string, tokenIds: string[]) => {
    console.log("[ResetMap Hook] Sending mutation:", { mapId, tokenIds });
    return new Promise((resolve, reject) => {
      mutate({
        variables: {
          input: {
            mapId,
            tokenIds,
          },
        },
        onCompleted: (data) => {
          console.log("[ResetMap Hook] Mutation completed:", data);
          resolve(data);
        },
        onError: (err) => {
          console.error("[ResetMap Hook] Mutation error:", err);
          reject(err);
        },
      });
    });
  };
};
