import graphql from "babel-plugin-relay/macro";

export const upsertTokenDataMutation = graphql`
  mutation tokenMutations_UpsertTokenDataMutation($input: TokenDataInput!) {
    upsertTokenData(input: $input) {
      id
      currentHp
      maxHp
      tempHp
      armorClass
      conditions
    }
  }
`;
