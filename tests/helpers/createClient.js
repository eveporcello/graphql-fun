import ApolloClient from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";

export function createClient() {
  const cache = new InMemoryCache();
  const httpLink = createHttpLink({ uri: process.env.REACT_APP_GRAPHQL_URI });
  const authLink = setContext((_, operation) => {
    const token = global.token;
    if (token) {
      return {
        headers: {
          ...operation.headers,
          authorization: `Bearer ${token}`
        }
      };
    } else {
      return operation;
    }
  });
  const httpAuthLink = authLink.concat(httpLink);
  const wsLink = new WebSocketLink({
    uri: process.env.REACT_APP_GRAPHQL_SUBSCRIPTIONS,
    options: {
      reconnect: true,
      lazy: true,
      connectionParams: () => ({
        authorization: global.token
      })
    }
  });
  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === "OperationDefinition" && operation === "subscription";
    },
    wsLink,
    httpAuthLink
  );

  const defaultOptions = {
    watchQuery: {
      fetchPolicy: "network-only",
      errorPolicy: "all"
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all"
    },
    mutate: {
      errorPolicy: "all"
    }
  };

  return new ApolloClient({ link, cache, defaultOptions });
}

export default createClient();
