import React from "react";
import { useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { Connections } from "./Connections";
import { AudiencePoll, Spotlight, Faces, ThankYou } from "./Callouts";
import { PerfIsRight, PerfIsRightFinal, Fightjay, Wejay } from "./Games";
import { LoadingScreen, Whoops404 } from "../ui";

export const QUERY_BOARD_STATE = gql`
  query boardState {
    game {
      name
      state
      maxPlayers
      minPlayers
      playerCount
      players {
        login
        name
        avatar
        guess
        duration
      }
      ... on Fightjay {
        results {
          leader
          node
          react
          graphql
          typescript
        }
      }
      ... on PerfIsRight {
        winner {
          answer
          player {
            login
            avatar
          }
        }
      }
    }
    callout {
      name
      state
      ... on AudiencePoll {
        results {
          question
          yesLabel
          noLabel
          yes
          no
        }
      }
    }
  }
`;

export const LISTEN_BOARD_STATE = gql`
  subscription boardStatus {
    callout {
      name
      state
      ... on AudiencePoll {
        results {
          question
          yesLabel
          noLabel
          yes
          no
        }
      }
    }
  }
`;

export const LISTEN_GAME_STATE = gql`
  subscription gameState {
    game {
      name
      state
      maxPlayers
      minPlayers
      playerCount
      players {
        login
        name
        avatar
        guess
        duration
      }
      ... on Fightjay {
        results {
          leader
          node
          react
          graphql
          typescript
        }
      }
      ... on PerfIsRight {
        winner {
          answer
          player {
            login
          }
        }
      }
    }
  }
`;

export default function Board() {
  const { loading, data, error } = useQuery(QUERY_BOARD_STATE);
  const { data: boardStatus } = useSubscription(LISTEN_BOARD_STATE);
  const { data: gameState } = useSubscription(LISTEN_GAME_STATE);

  if (loading) return <LoadingScreen />;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const game = gameState ? gameState.game : data.game;
  const callout = boardStatus ? boardStatus.callout : data.callout;

  if (callout) {
    switch (callout.name) {
      case "Audience Poll":
        return <AudiencePoll results={callout.results} />;
      case "Spotlight":
        return <Spotlight />;
      case "Faces":
        return <Faces />;
      case "Thank You":
        return <ThankYou />;
      default:
        return <Whoops404 />;
    }
  }

  if (game) {
    switch (game.name) {
      case "Perf is Right":
        return <PerfIsRight game={game} />;
      case "Perf is Right - FINAL":
        return <PerfIsRightFinal game={game} />;
      case "Fightjay":
        return <Fightjay game={game} />;
      case "Wejay":
        return <Wejay game={game} />;
      default:
        return <Whoops404 />;
    }
  }

  return <Connections />;
}
